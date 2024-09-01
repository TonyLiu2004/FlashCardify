'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FlashcardApiDemo() {
    const [message, setMessage] = useState<string | null>(null);
    const [flashcards, setFlashcards] = useState<any[] | null>(null);
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

    const handleSaveFlashcard = async () => {
        const flashcardData = {
            id: 'a57441fa-9260-49be-9b21-c1f3b01f9a1e',
            user_id: user?.id ?? '', // Use the fetched user ID
            deck_id: 'a57441fa-9260-49be-9b21-c1f3b01f9a1d', // Use the valid deck ID
            front_text: 'What is the capital of France?',
            back_text: 'Paris',
            created_at: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/flashcard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flashcard: flashcardData })
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
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

    const handleGetFlashcards = async () => {
        const deck_id = 'a57441fa-9260-49be-9b21-c1f3b01f9a1d'; // Use the valid deck ID

        try {
            const response = await fetch(`/api/flashcard?deck_id=${deck_id}&user_id=${user?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                const data = result.data;

                if (Array.isArray(data) && data.length > 0) {
                    setFlashcards(data);
                    setMessage('Flashcards fetched successfully');
                } else {
                    setFlashcards([]);
                    setMessage('No flashcards found');
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

    const handleDeleteFlashcard = async (flashcardId: string) => {
        const deck_id = 'a57441fa-9260-49be-9b21-c1f3b01f9a1d'; // Use the valid deck ID

        try {
            const response = await fetch(`/api/flashcard?flashcard_id=${flashcardId}&deck_id=${deck_id}&user_id=${user?.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setMessage('Flashcard deleted successfully');
                handleGetFlashcards();
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
                <button onClick={handleSaveFlashcard}>Save Flashcard</button>
                <button onClick={handleGetFlashcards}>Get Flashcards</button>
                {message && <p>{message}</p>}
                {flashcards && flashcards.length > 0 && (
                    <ul>
                        {flashcards.map((flashcard) => (
                            <li key={flashcard.id}>
                                {flashcard.front_text}: {flashcard.back_text}
                                <button
                                    onClick={() => handleDeleteFlashcard(flashcard.id)}
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
