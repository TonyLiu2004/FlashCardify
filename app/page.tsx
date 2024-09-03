'use client';

import React, { useEffect, useState, useRef } from 'react';
import Pricing from '@/components/ui/Pricing/Pricing';
import Features from '@/components/ui/Features/Features';
import { Box, Button, Typography } from '@mui/material';
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

        if (!userRes.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userRes.json();
        setUser(userData);

        if (!productsRes.ok) {
          throw new Error('Failed to fetch products data');
        }
        const productsData = await productsRes.json();
        setProducts(productsData);

        if (!subscriptionRes.ok) {
          throw new Error('Failed to fetch subscription data');
        }
        const subscriptionData = await subscriptionRes.json();
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
      const maxWidth = (window.innerWidth - cardWidth) / 2.2;
      const maxHeight = window.innerHeight - cardHeight;

      for (let i = 0; i < 12; i++) {
        let position: FlashcardPosition;
        let attempts = 0;
        do {
          position = {
            x: Math.random() * maxWidth,
            y: Math.random() * maxHeight,
          };
          if (i >= 6) {
            position.x += window.innerWidth / 2;
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

  return (
    <div>
      <Box
        height={'100vh'}
        display='flex'
        textAlign='center'
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'column'}
        position='relative'
        zIndex={2}
      >
        <Bounce cascade>
          <Typography
            variant='h1'
            style={{
              margin: '2px',
              fontFamily: 'cursive',
              fontSize: 'clamp(5rem, 6vw, 12rem)',
            }}
          >
            FlashCardify
          </Typography>
          <Typography variant='h5' style={{ margin: '2px' }}>
            Generate Your Own Flashcards With AI!
          </Typography>
        </Bounce>
        <Button
          sx={{
            backgroundColor: '#3469b6',
            color: 'white',
            borderRadius: '16px',
            padding: '10px 20px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            marginTop: '16px',
            textTransform: 'uppercase',
            transition: 'background-color 0.3s ease',
            opacity: 0, // Start with opacity 0 for fade-in effect
            animation: 'fadeIn 1s forwards',
            animationDelay: '1s',
            '&:hover': {
              backgroundColor: '#2b5791',
            },
          }}
          onClick={handleScrollToPricing}
        >
          Get Started
        </Button>

        {/* Render flashcards as background */}
        {backgroundFlashcards.map((card, index) => (
          <BackgroundCard key={index} x={card.x} y={card.y} />
        ))}
      </Box>

      <Features />

      <Box ref={pricingRef}>
        {error ? (
          <Typography color="error" variant="h6">
            Failed to load pricing information. Please try again later.
          </Typography>
        ) : (
          <Pricing user={user} products={products} subscription={subscription} />
        )}
      </Box>
    </div>
  );
}
