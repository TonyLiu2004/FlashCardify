import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/SecondButton/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/Navbar/dropdown-menu';
import { Check, X, MoreHorizontal, Star } from 'lucide-react';
import { useRouter } from "next/navigation";

interface DeckProps {
    title: string;
    id: string;
    description?: string;
    showDescription?: boolean;
    isLiked?: boolean;
    visibility?: string;
    shared?: boolean;
    userId?: string;
    likeCount?: number;
    onEdit?: (id: string, name: string, description: string) => void;
    onDelete?: (id: string) => void;
    onClone?: (id: string) => void;
    onPublish?: (id: string, visibility: string) => void;
}

const Deck: React.FC<DeckProps> = ({
    title,
    description,
    id,
    isLiked = false,
    visibility = 'private',
    shared = false,
    likeCount = 0,
    userId,
    onEdit,
    onDelete,
    onClone,
    onPublish
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [deckName, setDeckName] = useState(title);
    const [liked, setLiked] = useState(isLiked);
    const [likes, setLikes] = useState(likeCount);
    const [deckDescription, setDeckDescription] = useState(description || "");
    const router = useRouter();

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        if (onEdit) {
            onEdit(id, deckName, deckDescription);
        }
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        if (onDelete) {
            onDelete(id);
        }
    };

    const handleCloneClick = () => {
        if (onClone) {
            onClone(id);
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setDeckName(title);
    };

    const handleClick = () => {
        router.push(`/flashcards?name=${title}&id=${id}`);
    };

    const handlePublishClick = () => {
        if (onPublish) {
            const newVisibility = visibility === 'public' ? 'private' : 'public';
            onPublish(id, newVisibility);
        }
    };

    const handleLikeClick = async () => {
        if (!userId) {
            console.error('User ID is not available');
            return;
        }

        try {
            const response = await fetch('/api/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deck_id: id,
                    user_id: userId,
                    isStarred: !liked,
                }),
            });

            if (response.ok) {
                setLiked(!liked);
                setLikes(liked ? likes - 1 : likes + 1);
            } else {
                console.error('Failed to like/unlike the deck.');
            }
        } catch (error) {
            console.error('Error liking/unliking the deck:', error);
        }
    };

    const truncateTitle = (title: string) => {
        return title.length > 10 ? `${title.slice(0, 10)}...` : title;
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between h-full hover:shadow-xl transition-shadow duration-300 relative"
            style={{
                backgroundColor: "#c8c9d3",
            }}
        >
            <div className="absolute top-2 right-2 flex items-center space-x-2">
                <Button onClick={handleLikeClick} variant="ghost" size="icon">
                    <Star className={`h-4 w-4 ${liked ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                    {shared && <span className="ml-1 text-gray-700">{likes}</span>}
                    {!shared && visibility === 'public' && (
                        <span className="ml-1 text-blue-500">P</span>
                    )}
                </Button>
                {isEditing ? (
                    <>
                        <Button onClick={handleSaveClick} variant="ghost" size="icon" className="ml-2 text-black">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleCancelClick} variant="ghost" size="icon" className="ml-2 text-black">
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4 text-black" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuLabel className="text-black">Actions</DropdownMenuLabel>
                            {onPublish && (
                                <DropdownMenuItem onClick={handlePublishClick} className="text-black">
                                    {visibility === 'public' ? 'Unpublish' : 'Publish'}
                                </DropdownMenuItem>
                            )}
                            {!shared && onEdit && (
                                <DropdownMenuItem onClick={handleEditClick} className="text-black">Edit</DropdownMenuItem>
                            )}
                            {!shared && onDelete && (
                                <DropdownMenuItem onClick={handleDeleteClick} className="text-black">Delete</DropdownMenuItem>
                            )}
                            {onClone && (
                                <DropdownMenuItem onClick={handleCloneClick} className="text-black">Clone</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="mb-4">
                {isEditing ? (
                    <input
                        type="text"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        className="text-lg font-semibold text-gray-800 truncate w-full border-b-2 focus:outline-none"
                        style={{
                            backgroundColor: "#f2f2f2",
                        }}
                    />
                ) : (
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{truncateTitle(deckName)}</h3>
                )}
                {isEditing ? (
                    <textarea
                        value={deckDescription}
                        onChange={(e) => setDeckDescription(e.target.value)}
                        className="text-lg font-semibold text-gray-800 truncate w-full border-b-2 focus:outline-none"
                        style={{
                            backgroundColor: "#f2f2f2",
                        }}
                        rows={2}
                    />
                    ):( description ? (
                            <p style={{color:"black"}} className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {description}
                            </p>
                        ): (
                            <></>
                        )
                    )
                }
            </div>
            <div className="mt-auto">
                <button className="text-white text-sm font-medium py-2 px-4 rounded hover:bg-pink-500 transition-colors duration-300 w-full"
                style={{
                    backgroundColor:"#3e4756"
                }}
                    onClick={handleClick}
                >
                    View Deck
                </button>
            </div>
        </div>
    );
};

export default Deck;
