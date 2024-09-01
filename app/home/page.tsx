'use client';

import React, { useState, useEffect } from 'react';
import DeckComponent from '@/components/ui/Deck';
import LoadingDots from '@/components/ui/LoadingDots';
import Modal from '@/components/ui/Modal';
import { useRouter } from "next/navigation";
import { handleEdit, handleDelete, handleClone, handlePublish } from '@/utils/deckUtils';
import { Deck } from '@/types';

const HomePage = () => {
    const [userProfile, setUserProfile] = useState({
        name: '',
        avatar: '/placeholder-user.jpg',
    });

    const [stats, setStats] = useState({
        totalCardsReviewed: 0,
        totalCards: 0,
        decksStarred: 0,
        dailyStreak: 0,
        accuracyRate: 0,
        retentionRate: 0,
        cardsStreak: 0,
    });

    const [decks, setDecks] = useState<Deck[]>([]);
    const [isDecksLoading, setIsDecksLoading] = useState(true);
    const [user, setUser] = useState<{ id: string | null; user_metadata: { full_name: string; avatar_url: string } } | null>(null);

    const [currentDeck, setCurrentDeck] = useState<string | null>(null);
    const [currentDeckVisibility, setCurrentDeckVisibility] = useState<string>('private');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    const router = useRouter();

    const openDeleteModal = (deckId: string) => {
        setCurrentDeck(deckId);
        setIsDeleteModalOpen(true);
    };

    const openCloneModal = (deckId: string) => {
        setCurrentDeck(deckId);
        setIsCloneModalOpen(true);
    };

    const openPublishModal = (deckId: string, visibility: string) => {
        setCurrentDeck(deckId);
        setCurrentDeckVisibility(visibility);
        setIsPublishModalOpen(true);
    };

    useEffect(() => {
        const fetchUserDataAndStats = async () => {
            try {
                const userResponse = await fetch('/api/user');

                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await userResponse.json();
                setUser(userData);

                if (!userData.id) {
                    throw new Error('User ID is missing');
                }

                setUserProfile({
                    name: userData.user_metadata?.full_name || 'Anonymous',
                    avatar: userData.user_metadata?.avatar_url || '/placeholder-user.jpg',
                });

                const statsResponse = await fetch(`/api/stats?user_id=${userData.id}`);

                if (!statsResponse.ok) {
                    throw new Error('Failed to fetch stats data');
                }

                const statsData = await statsResponse.json();

                setStats({
                    totalCardsReviewed: statsData.data.totalCardsReviewed || 0,
                    totalCards: statsData.data.totalCards || 0,
                    decksStarred: statsData.data.decksStarred || 0,
                    dailyStreak: statsData.data.dailyStreak || 0,
                    accuracyRate: statsData.data.accuracyRate || 0,
                    retentionRate: statsData.data.retentionRate || 0,
                    cardsStreak: statsData.data.cardsStreak || 0,
                });

                const deckResponse = await fetch(`/api/deck?user_id=${userData.id}`);

                if (deckResponse.ok) {
                    const deckData = await deckResponse.json();
                    setDecks(deckData.data);
                } else {
                    setDecks([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setDecks([]);
            } finally {
                setIsDecksLoading(false);
            }
        };

        fetchUserDataAndStats();
    }, []);

    if (!user) {
        return <div className='text-center'>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center p-4">
            <div className="flex flex-col lg:flex-row w-full max-w-7xl space-y-8 lg:space-y-0 lg:space-x-8">
                {/* Left Column */}
                <div className="flex flex-col w-full lg:w-2/3 space-y-8">
                    {/* Profile Section */}
                    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
                        <img
                            className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-sm mb-4"
                            src={userProfile.avatar}
                            alt="User Avatar"
                        />
                        <h2 className="text-2xl font-bold text-black">
                            {userProfile.name}
                        </h2>
                        <div className="mt-6 text-center">
                            <h3 className="text-lg font-semibold text-black">Total Cards Reviewed</h3>
                            <p className="text-4xl font-bold text-blue-600">{stats.totalCardsReviewed}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-center w-full">
                            <div>
                                <h4 className="text-md font-medium text-black">Total Cards</h4>
                                <p className="text-2xl font-bold text-pink-500">{stats.totalCards}</p>
                            </div>
                            <div>
                                <h4 className="text-md font-medium text-black">Decks Starred</h4>
                                <p className="text-2xl font-bold text-green-500">{stats.decksStarred}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-black mb-4">Your Decks</h3>
                        {isDecksLoading ? (
                            <div className="flex justify-center items-center h-full p-10">
                                <LoadingDots />
                            </div>
                        ) : (decks.length > 0) ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {decks.slice(0, 6).map((deck) => (
                                        user?.id && (
                                            <DeckComponent
                                                key={deck.id}
                                                title={deck.name}
                                                description={deck.description}
                                                id={deck.id}
                                                userId={user.id}
                                                visibility={deck.visibility}
                                                isLiked={deck.isLiked}
                                                onEdit={(id: string, name: string, description: string) => handleEdit(id, name, description, user.id, setDecks, decks)}
                                                onDelete={() => openDeleteModal(deck.id)}
                                                onClone={() => openCloneModal(deck.id)}
                                                onPublish={() => {
                                                    if (deck.id && deck.visibility) {
                                                      openPublishModal(deck.id, deck.visibility);
                                                    }
                                                  }}
                                            />
                                        )
                                    ))}
                                </div>
                                {decks.length > 6 && (
                                    <div className="flex justify-center mt-4">
                                        <button
                                            className="text-pink-500 hover:underline"
                                            onClick={() => router.push('/decks')}
                                        >
                                            View More
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>No decks found.</p>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col w-full lg:w-1/3 space-y-8">
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-center mb-6 text-black">Daily Streak</h3>
                        <p className="text-3xl font-bold text-yellow-500 text-center">{stats.dailyStreak} Days</p>
                    </div>
                    <div className="bg-white shadow-lg rounded-xl p-6 w-full flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-black mb-4">Featured Deck</h3>
                        {user?.id && 
                        <DeckComponent 
                            title="React Basics" 
                            userId={"test"}
                            description="Learn the basics of React, the popular JavaScript library." 
                            id={"test"} 
                            showDescription 
                            onClone={() => openCloneModal('test')} 
                            />}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                title="Confirm Deletion"
                description="Are you sure you want to delete this deck? This action cannot be undone."
                onConfirm={() => handleDelete(currentDeck, user.id, setDecks, decks, setIsDeleteModalOpen)}
                onCancel={() => setIsDeleteModalOpen(false)}
                isOpen={isDeleteModalOpen}
                destructive
            />
            <Modal
                title="Confirm Clone"
                description="Are you sure you want to make a copy of this deck?"
                onConfirm={() => handleClone(currentDeck, user.id, setDecks, decks, setIsCloneModalOpen, 'userDecks')}
                onCancel={() => setIsCloneModalOpen(false)}
                isOpen={isCloneModalOpen}
            />
            <Modal
                title={currentDeckVisibility === 'public' ? 'Confirm Unpublish' : 'Confirm Publish'}
                description={`Are you sure you want to ${currentDeckVisibility === 'public' ? 'unpublish' : 'publish'} this deck?`}
                onConfirm={() => {
                    if (currentDeck) {
                        handlePublish(currentDeck, currentDeckVisibility === 'public' ? 'private' : 'public', user.id, setDecks, decks, setIsPublishModalOpen);
                    }
                }}
                onCancel={() => setIsPublishModalOpen(false)}
                isOpen={isPublishModalOpen}
            />
        </div>
    );
};

export default HomePage;
