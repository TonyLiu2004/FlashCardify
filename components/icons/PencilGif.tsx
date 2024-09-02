import React from 'react';
import pencil from '@/public/pencil.gif'; 
import Image from 'next/image';

const PencilGif = () => {
    return (
      <div>
        <Image src={pencil} alt="Pencil Gif" style={{ width: '100%', height: 'auto' }} />
      </div>
    );
  };
  
export default PencilGif;
