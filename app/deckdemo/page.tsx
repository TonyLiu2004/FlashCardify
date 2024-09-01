'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeckApiDemo() {
  const [message, setMessage] = useState<string | null>(null);
  const [decks, setDecks] = useState<any[] | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      } catch (error: unknown) {
        setUser(null);
        if (error instanceof Error) {
          setMessage(`Error: ${error.message}`);
        } else {
          setMessage('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [isLoading, user, router]);

  const handleSaveDeck = async () => {
    const deckData = {
      id: 'a57441fa-9260-49be-9b21-c1f3b01f9a1d',
      user_id: user?.id ?? '',
      name: 'First Deck',
      description: 'Test Deck',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deck: deckData }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        handleGetDecks(); // Refresh decks after saving
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };

  const handleGetDecks = async () => {
    try {
      const response = await fetch(`/api/deck?user_id=${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data;

        if (Array.isArray(data) && data.length > 0) {
          setDecks(data);
          setMessage('Decks fetched successfully');
        } else {
          setDecks([]);
          setMessage('No decks found');
        }
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      const response = await fetch(`/api/deck?deck_id=${deckId}&user_id=${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Deck deleted successfully');
        handleGetDecks(); // Refresh decks after deletion
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };

  if (isLoading) {
    return <p className='text-center justify-center'>Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-center">Hi</h1>
      <div>
        <button onClick={handleSaveDeck}>Save Deck</button>
        <button onClick={handleGetDecks}>Get Decks</button>
        {message && <p>{message}</p>}
        {decks && decks.length > 0 && (
          <ul>
            {decks.map((deck) => (
              <li key={deck.id}>
                {deck.name}: {deck.description}
                <button
                  onClick={() => handleDeleteDeck(deck.id)}
                  style={{ marginLeft: '10px', color: 'red' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
