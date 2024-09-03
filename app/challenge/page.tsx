'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import LoadingDots from '@/components/ui/LoadingDots';
import type { Flashcard, CleanedFlashcard } from '@/types';

export default function ChallengePage() {
    const [decks, setDecks] = useState<any[] | null>(null);
    const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
    const [quizMode, setQuizMode] = useState<string>('standard');
    const [message, setMessage] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
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
                setMessage('Error fetching user details.');
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

    useEffect(() => {
        if (user) {
            handleGetDecks();
        }
    }, [user]);

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
                } else {
                    setDecks([]);
                    setMessage('No decks found.');
                }
            } else {
                setMessage('Error fetching decks.');
            }
        } catch {
            setMessage('An unknown error occurred while fetching decks.');
        }
    };

    const questionGenerators: { [key: string]: (flashcards: CleanedFlashcard[]) => Promise<any> } = {
        standard: async (flashcards) => await generateQuestionsAPI(flashcards, 'standard'),
        timed: async (flashcards) => await generateQuestionsAPI(flashcards, 'timed'),
        //More modes here
    };

    const generateQuestionsAPI = async (flashcards: CleanedFlashcard[], mode: string) => {
        const generateQuestionsResponse = await fetch('/api/generate/challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                flashcards,
                mode,
            }),
        });

        if (!generateQuestionsResponse.ok) {
            throw new Error('Error generating quiz questions.');
        }

        return await generateQuestionsResponse.json();
    };

    const handleStartChallenge = async () => {
        if (!selectedDeck) {
            setMessage('Please select a deck to start the challenge.');
            return;
        }

        try {
            setIsStarting(true);
            const newChallengeId = uuidv4();

            const createChallengeResponse = await fetch('/api/challenge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: newChallengeId,
                    deck_id: selectedDeck,
                    user_id: user.id,
                    times_taken: 0,
                    overall_correct: 0,
                    overall_incorrect: 0,
                    overall_accuracy: 0.0,
                    status: 'started',
                }),
            });

            if (!createChallengeResponse.ok) {
                throw new Error('Error creating challenge record.');
            }

            const flashcardsResponse = await fetch(`/api/flashcard?deck_id=${selectedDeck}&user_id=${user.id}`);
            if (!flashcardsResponse.ok) {
                throw new Error('Error fetching flashcards.');
            }

            const { data: flashcards }: { data: Flashcard[] } = await flashcardsResponse.json();
            const cleanedFlashcards: CleanedFlashcard[] = flashcards.map(({ user_id, created_at, updated_at, deck_id, ...rest }) => rest);

            const questionsData = await questionGenerators[quizMode](cleanedFlashcards);
            if (questionsData && questionsData.questions) {
                const questionsArray = questionsData.questions.questions;
                console.log(questionsArray);

                const insertQuestionsResponse = await fetch('/api/challenge/questions/batch', {
                    method: 'POST',
                    headers: {
                        'Challenge-Type': quizMode,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        questions: questionsArray.map((question: any, index: number) => {
                            return {
                                id: uuidv4(),
                                challenge_id: newChallengeId,
                                question_number: index + 1,
                                flashcard_id: question.flashcard_id,
                                question: question.question,
                                choice_a: question.choice_a || 'NA',
                                choice_b: question.choice_b || 'NA',
                                choice_c: question.choice_c || 'NA',
                                choice_d: question.choice_d || 'NA',
                                answer: question.answer,
                                user_answer: null,
                                status: 'not completed',
                                shuffle_index: Math.floor(Math.random() * 100),
                                created_at: new Date().toISOString(),
                            };
                        }),
                    }),
                });

                if (!insertQuestionsResponse.ok) {
                    throw new Error('Error inserting questions.');
                }

                router.push(`/challenge/start?deck_id=${selectedDeck}&mode=${quizMode}&challenge_id=${newChallengeId}`);
            } else {
                setMessage('No questions returned.');
            }
        } catch (error) {
            console.error('Failed to start challenge:', error);
            setMessage('Failed to start challenge.');
        } finally {
            setIsStarting(false);
        }
    };

    if (isLoading) {
        return <p className="text-center text-zinc-200">Loading...</p>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-800 text-white">
            <div className="w-full max-w-md p-6 bg-black rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6">Start a Challenge</h1>
                <div className="mb-4">
                    <label htmlFor="deck" className="block text-sm font-medium mb-2">
                        Select a Deck
                    </label>
                    <select
                        id="deck"
                        value={selectedDeck ?? ''}
                        onChange={(e) => setSelectedDeck(e.target.value)}
                        className="w-full p-2 border border-zinc-700 rounded bg-zinc-900"
                        disabled={isStarting}
                    >
                        <option value="" disabled>
                            -- Select a Deck --
                        </option>
                        {decks?.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                                {deck.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="mode" className="block text-sm font-medium mb-2">
                        Select Quiz Mode
                    </label>
                    <select
                        id="mode"
                        value={quizMode}
                        onChange={(e) => setQuizMode(e.target.value)}
                        className="w-full p-2 border border-zinc-700 rounded bg-zinc-900"
                        disabled={isStarting}
                    >
                        <option value="standard">Standard</option>
                        <option value="timed">Timed</option>
                        {/* Add more modes here as needed */}
                    </select>
                </div>
                {message && <p className="text-red-500 text-center mb-4">{message}</p>}
                <button
                    onClick={handleStartChallenge}
                    className="w-full p-2 bg-zinc-700 rounded hover:bg-zinc-600 transition"
                    disabled={isStarting}
                >
                    {isStarting ? <LoadingDots /> : 'Start Challenge'}
                </button>
            </div>
        </div>
    );
}
