'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Grid,
  Container,
  Typography,
  Box,
  TextField,
  Button
} from '@mui/material';
import { useRouter } from 'next/navigation';
import DeckComponent from '@/components/ui/Deck';
import Modal from '@/components/ui/Modal';
import { v4 as uuidv4 } from 'uuid';

export default function Decks() {
  const [user, setUser] = useState('');
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isDecksLoading, setIsDecksLoading] = useState(true);
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const router = useRouter();
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [open, setOpen] = useState(false);
  const [updateDecks, setUpdateDecks] = useState(false);
  const [currentDeckVisibility, setCurrentDeckVisibility] = useState('private');

  const openPublishModal = (deckId, visibility) => {
    setCurrentDeck(deckId);
    setCurrentDeckVisibility(visibility);
    setIsPublishModalOpen(true);
  };

  const openDeleteModal = (deckId) => {
    setCurrentDeck(deckId);
    setIsDeleteModalOpen(true);
  };

  const openCloneModal = (deckId) => {
    setCurrentDeck(deckId);
    setIsCloneModalOpen(true);
  };

  const handleEdit = async (id, name, description) => {
    try {
      const updatedDecks = decks.map((deck) =>
        deck.id === id ? { ...deck, name, description } : deck
      );
      setDecks(updatedDecks);

      const response = await fetch('/api/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deck: { id, name, user_id: user?.id, description: description }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save the deck.');
      }
    } catch (error) {
      console.error('Error saving deck:', error);
    }
  };

  const handleSaveDeck = async () => {
    if (newDeckName === '') {
      alert('Please enter deck name.');
      return;
    }
    const uuid = uuidv4();
    setOpen(false);
    await handleCreateDeck(uuid);
    setUpdateDecks(!updateDecks);
  };

  const handleCreateDeck = async (uuid) => {
    const deckData = {
      id: uuid,
      user_id: user.id,
      name: newDeckName,
      description: newDeckDescription,
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
      console.error('Error creating deck:', error);
    }
  };

  const handlePublish = async (deckId, newVisibility) => {
    if (deckId) {
      try {
        const deckToUpdate = decks.find((deck) => deck.id === deckId);
        if (deckToUpdate) {
          const response = await fetch('/api/deck', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              deck: {
                ...deckToUpdate,
                visibility: newVisibility,
                user_id: user?.id
              }
            })
          });

          if (!response.ok) {
            throw new Error(
              `Failed to ${newVisibility === 'public' ? 'publish' : 'unpublish'} the deck.`
            );
          }

          // Update the local state to reflect the deck's new visibility status
          setDecks(
            decks.map((deck) =>
              deck.id === deckId ? { ...deck, visibility: newVisibility } : deck
            )
          );
          setCurrentDeckVisibility(newVisibility); // Update the current deck visibility state
        }
      } catch (error) {
        console.error(
          `Error ${newVisibility === 'public' ? 'publishing' : 'unpublishing'} deck:`,
          error
        );
      } finally {
        setIsPublishModalOpen(false);
      }
    }
  };

  const handleDelete = async () => {
    if (currentDeck) {
      try {
        const response = await fetch(
          `/api/deck?deck_id=${currentDeck}&user_id=${user?.id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete the deck.');
        }

        // Refresh or update the deck list after deletion
        setDecks(decks.filter((deck) => deck.id !== currentDeck));
      } catch (error) {
        console.error('Error deleting deck:', error);
      } finally {
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleClone = async () => {
    if (currentDeck) {
      try {
        const deckToClone = decks.find((deck) => deck.id === currentDeck);
        if (deckToClone) {
          const response = await fetch('/api/deck', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              deck: {
                name: `${deckToClone.name} (Copy)`,
                description: deckToClone.description,
                user_id: user?.id
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to clone the deck.');
          }

          const updatedDecksResponse = await fetch(
            `/api/deck?user_id=${user?.id}`
          );
          if (updatedDecksResponse.ok) {
            const updatedDeckData = await updatedDecksResponse.json();
            setDecks(updatedDeckData.data);
          }
        }
      } catch (error) {
        console.error('Error cloning deck:', error);
      } finally {
        setIsCloneModalOpen(false);
      }
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
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
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/signin');
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    if (user && user.id) {
      const fetchDecks = async () => {
        try {
          const deckResponse = await fetch(`/api/deck?user_id=${user.id}`);

          if (deckResponse.ok) {
            const deckData = await deckResponse.json();
            setDecks(deckData.data);
          } else {
            setDecks([]);
          }
        } catch (error) {
          setDecks([]);
          console.error('Error fetching decks:', error);
        } finally {
          setIsDecksLoading(false);
        }
      };
      fetchDecks();
    }
  }, [user, updateDecks]);

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div
      style={{
        backgroundColor: '#e7e6e3',
        height: '100vh',
        paddingTop: '20px'
      }}
    >
      <Container maxWidth="100vw" sx={{ mt: 14 }}>
        <h2
          style={{
            color: '#1f2937',
            fontSize: '40px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Your Decks
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', margin: '30px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
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
                marginLeft: '140px'
              }}
            />
          </div>
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              fontFamily: 'Roboto, Arial, sans-serif',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginLeft: 3,
              backgroundColor: '#B0C4DE',
              color: '#4A4A4A',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#91A4BC',
                transform: 'scale(1.03)'
              }
            }}
          >
            New Deck
          </Button>
        </div>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {decks && decks.length > 0 ? (
            decks
              .filter((deck) =>
                deck.name.toLowerCase().includes(filter.toLowerCase())
              )
              .map((deck) => (
                <Grid item xs={12} sm={6} md={4} key={deck.id}>
                  <DeckComponent
                    title={deck.name}
                    description={deck.description}
                    id={deck.id}
                    visibility={deck.visibility}
                    userId={user.id}
                    isLiked={deck.isLiked}
                    onEdit={handleEdit}
                    onDelete={openDeleteModal}
                    onClone={openCloneModal}
                    onPublish={() => {
                      if (deck.id && deck.visibility) {
                        openPublishModal(deck.id, deck.visibility);
                      }
                    }}
                  />
                </Grid>
              ))
          ) : isDecksLoading ? (
            <p style={{ color: 'black', margin: '0 auto' }}>Loading...</p>
          ) : (
            <p style={{ color: 'black', margin: '0 auto' }}>No decks found.</p>
          )}
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
      <Modal
        title="Confirm Clone"
        description="Are you sure you want to make a copy of this deck?"
        onConfirm={handleClone}
        onCancel={() => setIsCloneModalOpen(false)}
        isOpen={isCloneModalOpen}
      />
      <Modal
        title={
          currentDeckVisibility === 'public'
            ? 'Confirm Unpublish'
            : 'Confirm Publish'
        }
        description={`Are you sure you want to ${currentDeckVisibility === 'public' ? 'unpublish' : 'publish'} this deck?`}
        onConfirm={() => {
          if (currentDeck) {
            handlePublish(
              currentDeck,
              currentDeckVisibility === 'public' ? 'private' : 'public'
            );
          }
        }}
        onCancel={() => setIsPublishModalOpen(false)}
        isOpen={isPublishModalOpen}
      />

      <Dialog
        open={open}
        onClose={handleOpen}
        PaperProps={{
          sx: { backgroundColor: '#e7e6e3' }
        }}
      >
        <DialogTitle>Create New Deck</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              autoFocus
              margin="dense"
              label="Collection Name"
              type="text"
              fullWidth
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#4A4A4A', // Static border color
                    borderRadius: '10px' // Border radius
                  },
                  '&:hover fieldset': {
                    borderColor: '#4A4A4A', // Border color on hover
                    borderRadius: '10px' // Consistent border radius on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4A4A4A', // Border color when the field is focused
                    borderRadius: '10px' // Consistent border radius when focused
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#4A4A4A', // Label color, can be adjusted if needed
                  borderRadius: '10px' // Label doesn't actually use borderRadius, remove if unnecessary
                }
              }}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Description (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={newDeckDescription}
              onChange={(e) => setNewDeckDescription(e.target.value)}
              multiline
              rows={4}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#4A4A4A', // Static border color
                    borderRadius: '10px' // Border radius
                  },
                  '&:hover fieldset': {
                    borderColor: '#4A4A4A', // Border color on hover
                    borderRadius: '10px' // Consistent border radius on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4A4A4A', // Border color when the field is focused
                    borderRadius: '10px' // Consistent border radius when focused
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#4A4A4A', // Label color, can be adjusted if needed
                  borderRadius: '10px' // Label doesn't actually use borderRadius, remove if unnecessary
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <Box>
            <Button
              onClick={handleOpen}
              sx={{ color: '#4A4A4A', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDeck}
              sx={{ color: '#4A4A4A', fontWeight: 'bold' }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
}
