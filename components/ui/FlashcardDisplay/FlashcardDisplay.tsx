'use client'
import { useState, useEffect } from 'react';
import EmblaCarousel from '@/components/ui/EmblaCarousel'
import { EmblaOptionsType } from 'embla-carousel'
import './embla.css'

interface FlashcardProps {
    flashcard: Flashcard[],
}

interface Flashcard {
    id: string;
    user_id: string;
    front_text: string;
    back_text: string;
    created_at: string;
    updated_at: string;
    deck_id: string;
}
  
const OPTIONS: EmblaOptionsType = { loop: true }
const SLIDE_COUNT = 5

const FlashcardDisplay: React.FC<FlashcardProps> = ({ flashcard }) => {
    const [flashcards, setFlashcards] = useState<Flashcard[]>(flashcard);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchFlashcards = async () => {
            setLoading(true);
            setFlashcards(flashcard);
            console.log(flashcard[0]?.front_text);
            setLoading(false);
        };
        fetchFlashcards();
    }, [flashcard]);
    
    return(
        <div>
            <EmblaCarousel slides={flashcards} options={OPTIONS} />  
        </div>
    );
}

export default FlashcardDisplay;