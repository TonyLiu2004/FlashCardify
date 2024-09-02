import React from 'react';
import folder from '@/public/folder.gif'; 
import Image from 'next/image';

const FolderGif = () => {
    return (
      <div>
        <Image src={folder} alt="Folder Gif" style={{ width: '100%', height: 'auto' }} />
      </div>
    );
  };
  
export default FolderGif;
