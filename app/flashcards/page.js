'use client'
import { useEffect, useState } from "react"
import { Divider, Grid, Container, Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import CardComponent from '@/components/ui/Card';
import FlashcardDisplay from '@/components/ui/FlashcardDisplay';
import Modal from '@/components/ui/Modal';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '@/components/ui/Spinner/spinner.tsx';

export default function Flashcards(){
    const [user, setUser] = useState("")
    const [isUserLoading, setIsUserLoading] = useState(true)
    const [isCardsLoading, setIsCardsLoading] = useState(true)
    const [flashcards, setFlashcards] = useState([])
    const [deck, setDeck] = useState(null)
    const [filter, setFilter] = useState("")
    const [currentCard, setCurrentCard] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [open, setOpen] = useState(false)
    const [newCardFront, setNewCardFront] = useState("")
    const [newCardBack, setNewCardBack] = useState("")
    const [updatedCards, setUpdatedCards] = useState(false)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const deckId = searchParams.get('id')
    const name = searchParams.get('name')


    useEffect(() => {
        const fetchUserData = async () => {
        try {
            const userResponse = await fetch('/api/user');

            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
            console.error('Error fetching user:', error);
            } finally {
                setIsUserLoading(false);
            }
        };
        fetchUserData();
    }, [router]);

    useEffect(() => {
        if (!isUserLoading && !user) {
          router.push('/signin');
        }
      }, [isUserLoading, user, router]);

    useEffect(() => {
        if (user && user.id) {
            const fetchCards = async () => {
                try {
                    const cardsResponse = await fetch(`/api/flashcard?deck_id=${deckId}&user_id=${user.id}`);
                    if (cardsResponse.ok) {
                        const cardsData = await cardsResponse.json();
                        setFlashcards(cardsData.data);
                    } else {
                        setFlashcards([]);
                    }
                } catch (error) {
                    setFlashcards([]);
                    console.error('Error fetching flashcards:', error);
                } finally {
                    setIsCardsLoading(false);
                }
            };
            fetchCards();
        }
    }, [user, updatedCards])

    useEffect(() => {
        if (user && user.id) {
            const fetchDecks = async () => {
                try {
                    const deckResponse = await fetch(`/api/deck?user_id=${user.id}`);

                    if (deckResponse.ok) {
                        const deckData = await deckResponse.json();
                        setDeck(deckData.data.find((item) => item.name === name));
                    } else {
                        setDeck(null);
                    }
                } catch (error) {
                    setDeck(null);
                    console.error('Error fetching decks:', error);
                }
            };
            fetchDecks();
        }
    }, [user])

    const openDeleteModal = (card) => {
        setCurrentCard(card);
        setIsDeleteModalOpen(true);
    };

    const handleEdit = async (id, front, back) => {
        try {
            const updatedCards = flashcards.map(card => 
                card.id === id 
                ? { ...card, front_text: front, back_text: back, updated_at: new Date().toISOString() } 
                : card
            );
            setFlashcards(updatedCards)

            const updatedCard = updatedCards.find(card => card.id === id);
            if (!updatedCard) {
                throw new Error('Card not found');
            }
            const { ...updatedCardData } = updatedCard;

            const response = await fetch('/api/flashcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    flashcard: {
                        ...updatedCardData,
                        user_id: user?.id,
                        updated_at: new Date().toISOString(),
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save the deck.');
            }

        } catch (error) {
            console.error('Error saving card:', error);
        }
    };

    const handleDelete = async () => {
        if(currentCard){
            try {
                const response = await fetch(`/api/flashcard?flashcard_id=${currentCard.id}&deck_id=${currentCard.deck_id}&user_id=${user?.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete the card.');
                }

                // Refresh or update the card list after deletion
                setFlashcards(flashcards.filter(flashcard => flashcard.id !== currentCard.id));
            } catch (error) {
                console.error('Error deleting card:', error);
            } finally {
                setIsDeleteModalOpen(false);
            }
        }
    }

    const handleOpen = () => {
        setOpen(!open);
    }

    const handleSaveCard = async () => {
        if(newCardFront === "" || newCardBack == ""){
            alert("Please enter flashcard text.")
            return
        }

        const uuid = uuidv4();
        setOpen(false);
        await handleCreateCard(uuid);
        setUpdatedCards(!updatedCards);
    }

    const handleCreateCard = async (uuid) => {
        const flashcardData = {
            id: uuid,
            user_id: user.id,
            deck_id: deckId,
            front_text: newCardFront,
            back_text: newCardBack,
            created_at: new Date().toISOString()
        }

        try {
            const response = await fetch('/api/flashcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({flashcard: flashcardData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating flashcards:', error);
        }
    }
    return (
        <div style={{marginTop:"14vh"}}>
            <Container sx={{marginBottom: 5}}>
                <Typography variant="h4" textAlign="center" sx={{margin:"16px"}}>{name}</Typography>
                <Box sx={{ width: '50%', margin: '0 auto' }}>
                        <Divider sx={{ backgroundColor: 'white', height: '2px', marginBottom: 5 }} />
                </Box>
                <FlashcardDisplay flashcard={flashcards}/>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px' }}>
                    <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-lg font-semibold text-gray-800 border-b-2"
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                width: '100%',
                                maxWidth: '400px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                margin:"14px",
                                marginLeft:"160px"
                            }}
                        />
                    </div>
                    <Button 
                        variant="contained"
                        color="secondary"
                        onClick={handleOpen}
                        sx={{
                            fontFamily: 'Roboto, Arial, sans-serif',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            marginLeft: 3,
                            backgroundColor: "#3a6b8a",
                            '&:hover': { backgroundColor: '#314f63' },
                        }}
                    >  
                        New Card
                    </Button>
                </div>
                {isCardsLoading ? <Spinner/> : <></>}
                <Grid container spacing={3}>
                            {flashcards.filter(flashcard => 
                                flashcard.front_text.toLowerCase().includes(filter.toLowerCase()) ||
                                flashcard.back_text.toLowerCase().includes(filter.toLowerCase())
                            )
                            .map((flashcard) => (
                                <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                                    <CardComponent 
                                        flashcard={flashcard}
                                        id={flashcard.id}
                                        front_text={flashcard.front_text}
                                        back_text={flashcard.back_text}
                                        onEdit={handleEdit}
                                        onDelete={openDeleteModal}
                                    />
                                </Grid>
                            ))}
                        </Grid>
            </Container>
            <Modal
                title="Confirm Deletion"
                description="Are you sure you want to delete this deck? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                isOpen={isDeleteModalOpen}
                destructive
            />

            <Dialog open={open} onClose={handleOpen}>
                <DialogTitle>Create New Flashcard</DialogTitle>
                <DialogContent>
                    <Box>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Card Front"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newCardFront}
                            onChange={(e) => setNewCardFront(e.target.value)}
                            multiline
                            rows={4}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Card Back"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newCardBack}
                            onChange={(e) => setNewCardBack(e.target.value)}
                            multiline
                            rows={4}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                        <Button onClick={handleOpen}>Cancel</Button>
                        <Button onClick={handleSaveCard}>Save</Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </div>
    )
}