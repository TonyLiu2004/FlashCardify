'use client'
import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/SecondButton/button';
import { Divider, Grid, Container, Box, TextField, Typography, CardActionArea, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText} from "@mui/material"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/Navbar/dropdown-menu';
import { Check, X, MoreHorizontal, Star } from 'lucide-react';

interface CardProps {
  flashcard: object,
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  onEdit: (id: string, name: string, description: string) => void;
  onDelete: (flashcard: object) => void;
}


const Card: React.FC<CardProps> = ({ flashcard, id, front_text, back_text, onEdit, onDelete}) => {
  const [flipped, setFlipped] = useState(false)
  const [activeIndex, setActiveIndex] = useState(false)
  const [isEditing, setIsEditing] = useState(false);
  const [cardFront, setCardFront] = useState(front_text)
  const [cardBack, setCardBack] = useState(back_text)

  const handleCardClick = () => {
    setActiveIndex(!activeIndex);
    setFlipped(!flipped);
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
      onEdit(id, cardFront, cardBack);
      setIsEditing(false);
  };

  const handleDeleteClick = () => {
      onDelete(flashcard);
  };

  const handleCancelClick = () => {
      setIsEditing(false);
      setCardFront(front_text);
      setCardBack(back_text);
  };

  return (
    <div style={{ backgroundColor: "black", position: 'relative', width: '100%', height: 'auto' }}>
      <div className="absolute top-2 right-2 flex items-center space-x-2" style={{ zIndex: 1 }}>
        {isEditing ? (
            <>
              <Button onClick={handleSaveClick} variant="ghost" size="icon" className="ml-2 text-white">
                  <Check className="h-4 w-4" />
              </Button>
              <Button onClick={handleCancelClick} variant="ghost" size="icon" className="ml-2 text-white">
                  <X className="h-4 w-4" />
              </Button>
            </>
        ) : (
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4 text-white" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuLabel className="text-black">Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleEditClick} className="text-black">Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteClick} className="text-black">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
        </div>
        
        <CardActionArea
            onClick={() => {
              if(!isEditing) handleCardClick();
            }}
            sx={{
                '&:focus': {
                    outline: 'none',  // Disable the default focus outline
                    boxShadow: 'none', // Disable the focus ring
                }
            }}
        >
            <CardContent
                sx={{
                    border: `2px solid ${activeIndex ? '#d63f8e' : 'white'}`,
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', // Matching box shadow
                    borderRadius: '8px',
                    transition: 'border-color 0.3s', // Smooth transition for border color change
                    '&:focus': {
                        outline: 'none',  // Disable the focus outline on CardContent
                        boxShadow: 'none', // Disable the focus ring on CardContent
                    }
                }}
            >
                <Box sx={{
                    perspective: "1000px",
                    '& > div': {
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        width: "100%",
                        height: "200px",
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    },
                    '& > div > div': {
                        position: 'absolute',
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: "center",
                        padding: 2,
                        boxSizing: 'border-box',
                        overflow: 'auto',
                    },
                    '& > div > div:nth-of-type(2)': {
                        transform: 'rotateY(180deg)',
                    }
                }}>
                    <div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Typography variant="h5" component="div" sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                {isEditing ? (
                                  <textarea 
                                    value={cardFront}
                                    onChange={(e) => setCardFront(e.target.value)}
                                    style={{
                                      backgroundColor:"black",
                                      color:"white",
                                      border:"none",
                                      fontSize: '20px',
                                      width:"125%",
                                      height: 'auto',
                                      boxSizing: 'border-box',
                                      resize: 'none',
                                      overflowY: 'auto',
                                      marginTop:"10px",
                                      padding:"5px",
                                    }}
                                    rows={5}
                                  />
                                ) : (front_text)}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h5" component="div" sx={{ fontSize: '18px', width: '100%', display: 'flex', justifyContent: 'center'  }}>
                            {isEditing ? (
                                  <textarea 
                                    value={cardBack}
                                    onChange={(e) => setCardBack(e.target.value)}
                                    style={{
                                      backgroundColor:"black",
                                      color:"white",
                                      border:"none",
                                      fontSize: '20px',
                                      width:"125%",
                                      height: 'auto',
                                      boxSizing: 'border-box',
                                      resize: 'none',
                                      overflowY: 'auto',
                                      marginTop:"10px",
                                      padding:"5px",
                                    }}
                                    rows={5}
                                  />
                                ) : (back_text)}
                            </Typography>
                        </div>
                    </div>
                </Box>
            </CardContent>
        </CardActionArea>
    </div>
  );
}

export default Card;