'use client';
import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/SecondButton/button';
import {
  Divider,
  Grid,
  Container,
  Box,
  TextField,
  Typography,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/Navbar/dropdown-menu';
import { Check, X, MoreHorizontal, Star } from 'lucide-react';

interface CardProps {
  flashcard: object;
  id: string;
  front_text: string;
  back_text: string;
  created_at: string;
  onEdit: (id: string, name: string, description: string) => void;
  onDelete: (flashcard: object) => void;
}

const flashcardsx = {
  width: '100%',
  justifyContent: 'center',
  display: '-webkit-box',
  WebkitLineClamp: 4, // limits to a max of 4 lines
  WebkitBoxOrient: 'vertical',
  padding: '8px'
};

const Card: React.FC<CardProps> = ({
  flashcard,
  id,
  front_text,
  back_text,
  onEdit,
  onDelete
}) => {
  const [flipped, setFlipped] = useState(false);
  const [activeIndex, setActiveIndex] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cardFront, setCardFront] = useState(front_text);
  const [cardBack, setCardBack] = useState(back_text);

  const handleCardClick = () => {
    setActiveIndex(!activeIndex);
    setFlipped(!flipped);
  };

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
    <div
      style={{
        backgroundColor: '#FAFAFA',
        position: 'relative',
        width: '100%',
        height: 'auto'
      }}
    >
      <div
        className="absolute top-2 right-2 flex items-center space-x-2"
        style={{ zIndex: 1 }}
      >
        {isEditing ? (
          <>
            <Button
              onClick={handleSaveClick}
              variant="ghost"
              size="icon"
              className="ml-2 text-white"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCancelClick}
              variant="ghost"
              size="icon"
              className="ml-2 text-white"
            >
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
              <DropdownMenuLabel className="text-black">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleEditClick}
                className="text-black"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-black"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <CardActionArea
        disableRipple
        onClick={() => {
          if (!isEditing) handleCardClick();
        }}
        sx={{
          '&:focus': {
            outline: 'none', // Disable the default focus outline
            boxShadow: 'none' // Disable the focus ring
          },
          background: 'none',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'scale(1.04)' // Scale up the card on hover
          }
        }}
      >
        <CardContent
          sx={{
            borderRadius: '8px',
            padding: 0
          }}
        >
          <Box
            sx={{
              perspective: '1000px',
              '& > div': {
                transition: 'transform 0.3s',
                transformStyle: 'preserve-3d',
                position: 'relative',
                width: '100%',
                height: '200px',
                borderRadius: '8px',
                transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                background: flipped
                  ? 'linear-gradient(180deg, #B0C4DE, #FAFAFA)'
                  : 'linear-gradient(180deg, #FAFAFA, #B0C4DE)'
              },
              '& > div > div': {
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 2,
                boxSizing: 'border-box',
                overflow: 'auto',
                borderRadius: '8px',
                background: flipped
                  ? 'linear-gradient(180deg, #FAFAFA, #B0C4DE)'
                  : 'linear-gradient(180deg, #B0C4DE, #FAFAFA)'
              },
              '& > div > div:nth-of-type(2)': {
                transform: 'rotateX(180deg)'
              }
            }}
          >
            <div
              style={{
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ ...flashcardsx }}
                >
                  {isEditing ? (
                    <textarea
                      value={cardFront}
                      onChange={(e) => setCardFront(e.target.value)}
                      style={{
                        background: 'linear-gradient(180deg, #718e4d, #3a6b8a)',
                        color: 'white',
                        border: 'none',
                        fontSize: '20px',
                        width: '125%',
                        height: 'auto',
                        boxSizing: 'border-box',
                        resize: 'none',
                        overflowY: 'auto',
                        marginTop: '10px',
                        padding: '5px'
                      }}
                      rows={5}
                    />
                  ) : (
                    front_text
                  )}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{ ...flashcardsx }}
                >
                  {isEditing ? (
                    <textarea
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      style={{
                        background: 'linear-gradient(180deg, #3a6b8a, #718e4d)',
                        color: 'white',
                        border: 'none',
                        fontSize: '20px',
                        width: '125%',
                        height: 'auto',
                        boxSizing: 'border-box',
                        resize: 'none',
                        overflowY: 'auto',
                        marginTop: '10px',
                        padding: '5px'
                      }}
                      rows={5}
                    />
                  ) : (
                    back_text
                  )}
                </Typography>
              </div>
            </div>
          </Box>
        </CardContent>
      </CardActionArea>
    </div>
  );
};

export default Card;
