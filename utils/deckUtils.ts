import { Deck } from '@/types';

export const handleEdit = async (
    id: string,
    name: string,
    description: string,
    userId: string | null,
    setDecks: (decks: Deck[]) => void,
    decks: Deck[]
  ) => {
    try {
      const deckToEdit = decks.find(deck => deck.id === id);
  
      if (!deckToEdit) {
        throw new Error('Deck not found');
      }

      const updatedDecks = decks.map(deck =>
        deck.id === id ? { ...deck, name, description } : deck
      );
      setDecks(updatedDecks);
  
      const response = await fetch('/api/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deck: { 
            id, 
            name, 
            description, 
            visibility: deckToEdit.visibility,
            user_id: userId 
          } 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save the deck.');
      }
    } catch (error) {
      console.error('Error saving deck:', error);
    }
  };
  
export const handleDelete = async (
  currentDeck: string | null,
  userId: string | null,
  setDecks: (decks: Deck[]) => void,
  decks: Deck[],
  setIsDeleteModalOpen: (isOpen: boolean) => void
) => {
  if (currentDeck) {
    try {
      const response = await fetch(`/api/deck?deck_id=${currentDeck}&user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the deck.');
      }

      setDecks(decks.filter(deck => deck.id !== currentDeck));
    } catch (error) {
      console.error('Error deleting deck:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  }
};

export async function handleClone(
    deckId: string | null,
    userId: string | null,
    setDecks: React.Dispatch<React.SetStateAction<Deck[]>>,
    allDecks: Deck[],
    setIsCloneModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    pageType: 'shared' | 'home' | 'userDecks'
  ) {
    if (!deckId || !userId) {
      console.error('Deck ID or User ID is missing');
      return;
    }
  
    try {
      const deckToClone = allDecks.find(deck => deck.id === deckId);
      if (!deckToClone) {
        throw new Error('Deck to clone not found');
      }
  
      const response = await fetch('/api/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deck: {
            name: `${deckToClone.name} (Copy)`,
            description: deckToClone.description,
            user_id: userId,
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to clone the deck.');
      }

      let updatedDecksResponse;
      if (pageType === 'shared') {
        updatedDecksResponse = await fetch('/api/shared');
      } else {
        updatedDecksResponse = await fetch(`/api/deck?user_id=${userId}`);
      }
  
      if (!updatedDecksResponse.ok) {
        throw new Error('Failed to fetch updated decks.');
      }
  
      const updatedDeckData = await updatedDecksResponse.json();
  
      if (pageType === 'shared') {
        setDecks(updatedDeckData.data.filter((deck: Deck) => deck.visibility === 'public' || deck.shared));
      } else {
        setDecks(updatedDeckData.data.filter((deck: Deck) => deck.user_id === userId));
      }
  
    } catch (error) {
      console.error('Error cloning deck:', error);
    } finally {
      setIsCloneModalOpen(false);
    }
  }  
  
export const handlePublish = async (
  deckId: string,
  newVisibility: string,
  userId: string | null,
  setDecks: (decks: Deck[]) => void,
  decks: Deck[],
  setIsPublishModalOpen: (isOpen: boolean) => void
) => {
  if (deckId) {
    try {
      const deckToUpdate = decks.find(deck => deck.id === deckId);
      if (deckToUpdate) {
        const response = await fetch('/api/deck', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deck: {
              ...deckToUpdate,
              visibility: newVisibility,
              user_id: userId,
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${newVisibility === 'public' ? 'publish' : 'unpublish'} the deck.`);
        }

        setDecks(decks.map(deck => deck.id === deckId ? { ...deck, visibility: newVisibility } : deck));
      }
    } catch (error) {
      console.error(`Error ${newVisibility === 'public' ? 'publishing' : 'unpublishing'} deck:`, error);
    } finally {
      setIsPublishModalOpen(false);
    }
  }
};
