'use client';

import React, { useEffect, useState, useRef } from 'react';
import Pricing from '@/components/ui/Pricing/Pricing';
import { Container, Box, Button, Typography } from '@mui/material';
import Typing from 'react-typing-effect';
import { Bounce } from 'react-awesome-reveal';
import BackgroundCard from '@/components/ui/Animations/BackgroundCard';
import { User } from '@supabase/supabase-js';
import { ProductWithPrices, SubscriptionWithProduct, FlashcardPosition } from '@/types';

export default function PricingPage() {
  const [user, setUser] = useState<User | null | undefined>(null);
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionWithProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundFlashcards, setBackgroundFlashcards] = useState<FlashcardPosition[]>([]);

  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, productsRes, subscriptionRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/products'),
          fetch('/api/subscriptions'),
        ]);

        if (!userRes.ok || !productsRes.ok || !subscriptionRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [userData, productsData, subscriptionData] = await Promise.all([
          userRes.json(),
          productsRes.json(),
          subscriptionRes.json(),
        ]);

        setUser(userData);
        setProducts(productsData);
        setSubscription(subscriptionData);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout | null = null;

    const generateBackgroundFlashcards = () => {
      const cards: FlashcardPosition[] = [];
      const cardWidth = 80;
      const cardHeight = 120;
      const maxAttempts = 100;
      const halfWidth = (window.innerWidth - cardHeight) / 2;
      const maxHeight = window.innerHeight - cardWidth;

      for (let i = 0; i < 10; i++) {
        let position: FlashcardPosition;
        let attempts = 0;
        do {
          position = {
            x: Math.random() * halfWidth,
            y: Math.random() * maxHeight,
          };
          if (i >= 5) {
            position.x += halfWidth;
          }
          attempts++;
        } while (
          attempts < maxAttempts &&
          cards.some((card) => isOverlapping(card, position, cardWidth, cardHeight))
        );

        cards.push(position);
      }
      setBackgroundFlashcards(cards);
    };

    const isOverlapping = (
      cardA: FlashcardPosition,
      cardB: FlashcardPosition,
      cardWidth: number,
      cardHeight: number
    ) => {
      return (
        cardA.x < cardB.x + cardWidth &&
        cardA.x + cardWidth > cardB.x &&
        cardA.y < cardB.y + cardHeight &&
        cardA.y + cardHeight > cardB.y
      );
    };

    generateBackgroundFlashcards();
    const throttledResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(generateBackgroundFlashcards, 250);
    };
    window.addEventListener('resize', throttledResize);
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', throttledResize);
    };
  }, []);

  const handleScrollToPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <p className='text-center justify-center'>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <Container>
      <Box
        height={'100vh'}
        width='100%'
        display='flex'
        textAlign='center'
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'column'}
        position='relative'
        zIndex={2}
      >
        <Bounce cascade>
          <Typography variant='h1' style={{ margin: '2px' }}>
            FlashCardify
          </Typography>
          <Typography variant='h5' style={{ margin: '2px' }}>
            <Typing text={['Generate Your Own Flashcards With AI!']} speed={100} eraseDelay={1000} />
          </Typography>
          <Button
            sx={{
              backgroundColor: '#3469b6', // Primary button color
              color: 'white', // Text color
              borderRadius: '20px', // Rounded corners
              padding: '10px 20px', // Padding for a bigger button
              fontSize: '18px', // Larger font size for emphasis
              fontWeight: 'bold', // Bold text for importance
              border: 'none', // Removing the default border
              marginTop: '16px', // Space above the button
              textTransform: 'uppercase', // Uppercase text for clarity
              transition: 'background-color 0.3s ease', // Smooth color transition
              '&:hover': {
                backgroundColor: '#2b5791', // Change to black on hover
              },
            }}
            onClick={handleScrollToPricing}
          >
            Get Started
          </Button>
        </Bounce>

        {/* Render flashcards as background */}
        {backgroundFlashcards.map((card, index) => (
          <BackgroundCard key={index} x={card.x} y={card.y} />
        ))}
      </Box>

      <Box ref={pricingRef}>
        <Pricing user={user} products={products ?? []} subscription={subscription} />
      </Box>
      
    </Container>
  );
}
