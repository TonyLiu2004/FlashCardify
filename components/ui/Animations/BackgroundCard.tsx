import React from 'react';

interface FlashcardProps {
  x: number;
  y: number;
}

const BackgroundCard: React.FC<FlashcardProps> = ({ x, y }) => {
  const cardWidth = 80;
  const cardHeight = 120;
  const randomRotation = Math.random() * 30 - 15; // Random rotation between -15 and 15 degrees

  return (
    <div
      style={{
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        transform: `rotate(${randomRotation}deg)`,
        zIndex: 1, // Ensure this is behind the text
        opacity: 0.5, // Adjust the opacity to make it less obtrusive
        animation: `rotate ${Math.random() * 5 + 3}s infinite alternate ease-in-out`,
        overflow: 'hidden', // Ensure content doesn't overflow
        maxWidth: `calc(100vw - ${cardWidth}px)`, // Ensure it doesn't exceed viewport width
        maxHeight: `calc(100vh - ${cardHeight}px)`, // Ensure it doesn't exceed viewport height
      }}
    >
      
    </div>
  );
};

export default BackgroundCard;
