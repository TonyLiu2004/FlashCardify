'use client';

import { Grid, FormControl, Select, MenuItem, InputLabel, Container, Box, Button, TextField, Typography, Paper, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/ui/Spinner/spinner.tsx';
import debounce from 'lodash/debounce';

export default function Generate() {
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [toSave, setToSave] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [text, setText] = useState("");
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [saveMode, setSaveMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCardsLoading, setIsCardsLoading] = useState(false);
    const [decks, setDecks] = useState([]);
    const [deckSaving, setDeckSaving] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState("");
    const [description, setDescription] = useState("")

    const router = useRouter();
    const flashcardsPreviewRef = useRef(null);

    // Debounced API call for generating flashcards
    const debouncedGenerateFlashcards = useCallback(debounce(async (text) => {
        try {
            setIsCardsLoading(true);
            setFlashcards([]);
            const response = await fetch('api/generate', {
                method: "POST",
                body: text,
            });
            const data = await response.json();
            setFlashcards(data);
            setToSave(data.map(() => false));
            scrollToFlashcards();
        } catch (error) {
            console.error('Error generating flashcards:', error);
        } finally {
            setIsCardsLoading(false);
        }
    }, 300), []);

    useEffect(() => {
        const fetchUserDataAndDecks = async () => {
            try {
                // First, fetch user data
                const userResponse = await fetch('/api/user');
    
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                
                    // After the user data is fetched successfully, fetch the decks
                    const deckResponse = await fetch(`/api/deck?user_id=${userData.id}`);
                
                    if (deckResponse.ok) {
                        const deckData = await deckResponse.json();
                        setDecks(deckData.data);
                    } else {
                        setDecks([]);
                    }
                } else {
                    setUser(null);
                    router.push('/signin');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchUserDataAndDecks();
    }, [router]);

    const handleSubmit = () => {
        debouncedGenerateFlashcards(text);
    };

    const handleSaveDeck = async (uuid) => {
        const deckData = {
            id: uuid,
            user_id: user.id,
            name: name,
            description: description, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/deck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deck: deckData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving deck:', error);
        }
    };

    const handleCardClick = useCallback((index) => {
        setActiveIndex(index);
        setFlipped((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    }, []);

    const handleSelectCard = useCallback((id) => {
        setToSave((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    }, []);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSaveMode = () => {
        setSaveMode(!saveMode);
    };

    const handleSelectAll = () => {
        setToSave(flashcards.map(() => true));
    };

    const handleSetDeckSaving = () => {
        setDeckSaving(!deckSaving);
    };

    const saveFlashCards = async () => {
        if (!name) {
            alert("Please enter a name");
            return;
        }

        const countTrueValues = Object.values(toSave).filter(value => value).length;
        if (countTrueValues === 0) {
            alert("Please select the flashcards you want to save.");
            setOpen(false);
            return;
        }

        const uuid = uuidv4();
        setOpen(false);
        await handleSaveDeck(uuid);
        await handleSaveFlashCards(uuid);
        router.push('/decks');
    };

    const handleSaveFlashCards = async (uuid) => {
        const flashcardDataArray = flashcards.map((flashcard, index) => ({
            id: flashcard.id || uuidv4(),
            user_id: user.id,
            deck_id: uuid,
            front_text: flashcard.front,
            back_text: flashcard.back,
            created_at: new Date().toISOString()
        }));

        const selectedFlashcards = flashcardDataArray.filter((_, index) => toSave[index]);

        try {
            const response = await fetch('/api/flashcard/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flashcards: selectedFlashcards, userId: user.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving flashcards:', error);
        }
    };

    const saveToExistingDeck = async () => {
        if (!selectedDeck) {
            alert("Please select a deck.");
            return;
        }
        await handleSaveFlashCards(selectedDeck);
        router.push('/decks');
    };

    const handleSelectDeck = (event) => {
        setSelectedDeck(event.target.value);
    };

    const scrollToFlashcards = () => {
        if (flashcardsPreviewRef.current) {
            window.scrollTo({
                top: flashcardsPreviewRef.current.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    };

    const memoizedFlashcards = useMemo(() => {
        return flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <CardActionArea
                    onClick={() => {
                        if (saveMode) {
                            handleSelectCard(index);
                        } else {
                            handleCardClick(index);
                        }
                    }}
                    sx={{
                        backgroundColor: `${toSave[index] ? '#718e4d' : '#3a6b8a'}`,
                        transition: 'border-color 0.3s ease',
                    }}
                >
                    <CardContent
                        sx={{
                            border: `2px solid ${activeIndex === index ? '#d63f8e' : 'white'}`,
                            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            transition: 'border-color 0.3s',
                        }}
                    >
                        <Box sx={{
                            perspective: "1000px",
                            '& > div': {
                                transition: 'transform 0.6s',
                                transformStyle: 'preserve-3d',
                                position: 'relative',
                                width: "100%",
                                height: "200px",
                                transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                            },
                            '& > div > div': {
                                position: 'absolute',
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: "center",
                                padding: 2,
                                boxSizing: 'border-box',
                                overflow: 'auto',
                            },
                            '& > div > div:nth-of-type(2)': {
                                transform: 'rotateY(180deg)',
                            }
                        }}>
                            <div>
                                <div>
                                    <Typography variant="h5" component="div">
                                        {flashcard.front}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="h5" component="div" sx={{ fontSize: '18px' }}>
                                        {flashcard.back}
                                    </Typography>
                                </div>
                            </div>
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Grid>
        ));
    }, [flashcards, activeIndex, saveMode, toSave, flipped]);

    return (
        <div>
            <Container maxWidth="md">
                <Box sx={{
                    mt: 4,
                    mb: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h4">AI Generated Flashcards</Typography>
                    <Paper sx={{ p: 4, width: "100%", marginTop: 4 }}>
                        <TextField
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            label="Flashcard Topic"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'black',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'black',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'black',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'black',
                                },
                            }}
                            InputLabelProps={{
                                style: {
                                    color: 'black',
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: 'black',
                                color: 'white',
                                border: '2px solid transparent',
                                position: 'relative',
                                '&:hover': {
                                    backgroundColor: 'black',
                                    borderColor: 'transparent',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: -2,
                                        left: -2,
                                        right: -2,
                                        bottom: -2,
                                        borderRadius: 'inherit',
                                        border: '2px solid #EC4899',
                                        pointerEvents: 'none',
                                    },
                                },
                            }}
                            onClick={handleSubmit}
                            fullWidth
                            disabled={isCardsLoading}
                        >
                            Generate
                        </Button>
                    </Paper>
                </Box>

                <Box ref={flashcardsPreviewRef} sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h5">Flashcards Preview</Typography>
                    <Box sx={{ width: '50%', margin: '0 auto' }}>
                        <Divider sx={{ backgroundColor: 'white', height: '2px', marginBottom: 5 }} />
                    </Box>
                    {isCardsLoading ? <Spinner /> : null}
                    {flashcards.length > 0 ? (
                        <Grid container spacing={3} width="1200px">
                            {memoizedFlashcards}
                        </Grid>
                    ) : (
                        <Typography variant="h6" sx={{ mt: 4, color: 'white' }}>
                            No cards generated yet
                        </Typography>
                    )}

                    {flashcards.length > 0 && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleOpen}
                                sx={{
                                    fontFamily: 'Roboto, Arial, sans-serif',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    margin: 1,
                                    marginBottom: 4,
                                    textDecoration: "bold",
                                    backgroundColor: "#3a6b8a",
                                    '&:hover': { backgroundColor: '#314f63' }
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSaveMode}
                                sx={{
                                    fontFamily: 'Roboto, Arial, sans-serif',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    margin: 1,
                                    marginBottom: 4,
                                    backgroundColor: `${saveMode ? '#718e4d' : '#3a6b8a'}`,
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: `${saveMode ? '#5a6e42' : '#314f63'}`,
                                    },
                                }}
                            >
                                Select
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleSelectAll}
                                sx={{
                                    fontFamily: 'Roboto, Arial, sans-serif',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    margin: 1,
                                    marginBottom: 4,
                                    backgroundColor: "#3a6b8a",
                                    '&:hover': { backgroundColor: '#314f63' },
                                }}
                            >
                                Select All
                            </Button>
                        </Box>
                    )}
                </Box>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Save Flashcards</DialogTitle>
                    <DialogContent>
                        {deckSaving ? (
                            <Box>
                                <FormControl fullWidth>
                                    <InputLabel>Select Deck</InputLabel>
                                    <Select
                                        labelId="select-label"
                                        value={selectedDeck}
                                        onChange={handleSelectDeck}
                                        label="Select Deck"
                                    >
                                        {decks.map((deck) => (
                                            <MenuItem key={deck.id} value={deck.id}>
                                                {deck.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        ) : (
                            <Box>
                                <DialogContentText>
                                    Please enter a name for your flashcard collection
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Collection Name"
                                    type="text"
                                    fullWidth
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    variant="outlined"
                                />
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Description (Optional)"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={4}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={handleSetDeckSaving}>
                            {deckSaving ? 'New Deck' : 'Save to Existing Deck'}
                        </Button>
                        <Box>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={() => {
                                setOpen(false);
                                if (deckSaving) {
                                    saveToExistingDeck();
                                } else {
                                    saveFlashCards();
                                }
                            }}>Save</Button>
                        </Box>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}
