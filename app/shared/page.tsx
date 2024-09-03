'use client';

import { useEffect, useState } from 'react';
import DeckComponent from '@/components/ui/Deck';
import Modal from '@/components/ui/Modal';
import { handleClone, handlePublish } from '@/utils/deckUtils';
import { Deck } from '@/types';

export default function PublicPage() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [currentDeck, setCurrentDeck] = useState<string | null>(null);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();

                if (response.ok && data.id) {
                    setCurrentUserId(data.id);
                } else {
                    console.error('Failed to fetch user ID');
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };

        fetchCurrentUserId();
    }, []);

    useEffect(() => {
        const fetchPublicDecks = async () => {
            try {
                const response = await fetch('/api/shared');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch public decks');
                }
                setDecks(data.data);
                setFilteredDecks(data.data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicDecks();
    }, []);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = decks.filter(deck =>
            deck.name.toLowerCase().includes(lowercasedQuery) ||
            (deck.description && deck.description.toLowerCase().includes(lowercasedQuery))
        );
        setFilteredDecks(results);
    }, [searchQuery, decks]);

    const openCloneModal = (deckId: string) => {
        setCurrentDeck(deckId);
        setIsCloneModalOpen(true);
    };

    if (isLoading) {
        return <div style={{color:"black", margin:"0 auto"}}>Loading...</div>;
    }

    if (error) {
        return <div style={{color:"black", margin:"0 auto"}}>Error: {error}</div>;
    }

    return (
        <div className="p-10" style={{
            backgroundColor:"#e7e6e3", 
            height:"100vh", 
            width:"100%",
            paddingTop:"16vh",
        }}>
            <div className="flex justify-center items-center text-center flex-col">
            <h2 style={{color:"#1f2937", 
                    fontSize:"40px", 
                    textAlign:"center", 
                    fontWeight: "bold",
                    fontFamily: "'Poppins', sans-serif",
                }}>Public Decks</h2>
                <input
                    type="text"
                    placeholder="Search decks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-6 w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-black"
                    style={{
                        margin:"30px"
                    }}
                />
            </div>


            {filteredDecks.length === 0 ? (
                <p style={{color:"black", margin:"0 auto"}}>No public decks available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredDecks.map((deck) => {
                        const isLiked = currentUserId && deck.likes && Array.isArray(deck.likes)
                            ? deck.likes.some(like => like.user_id === currentUserId)
                            : false;

                        return (
                            <DeckComponent
                                key={deck.id}
                                title={deck.name}
                                description={deck.description}
                                id={deck.id}
                                userId={currentUserId || ''} // Use an empty string if currentUserId is null
                                likeCount={deck.likes?.length || 0}
                                isLiked={isLiked}
                                onClone={() => openCloneModal(deck.id)}
                                shared
                            />
                        );
                    })}
                </div>
            )}
            {/* Modals */}
            <Modal
                title="Confirm Clone"
                description="Are you sure you want to make a copy of this deck?"
                onConfirm={() => handleClone(currentDeck, currentUserId, setDecks, decks, setIsCloneModalOpen, 'shared')}
                onCancel={() => setIsCloneModalOpen(false)}
                isOpen={isCloneModalOpen}
            />
        </div>
    );
}
