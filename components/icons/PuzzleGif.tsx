import React from 'react';
import puzzle from '@/public/puzzle.gif'; 
import Image from 'next/image';

const PuzzleGif = () => {
    return (
      <div>
        <Image src={puzzle} alt="Puzzle Gif" style={{ width: '100%', height: 'auto' }} />
      </div>
    );
  };
  
export default PuzzleGif;
