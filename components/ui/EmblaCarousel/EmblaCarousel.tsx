import React from 'react'
import { useState, useEffect } from 'react';
import { EmblaOptionsType } from 'embla-carousel'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import useEmblaCarousel from 'embla-carousel-react'
import { CardActionArea, CardContent, Box, Typography } from "@mui/material"


interface Flashcard {
    id: string;
    user_id: string;
    front_text: string;
    back_text: string;
    created_at: string;
    updated_at: string;
    deck_id: string;
}
  

type PropType = {
  slides: Flashcard[]
  options?: EmblaOptionsType
}

const flashcardsx = {
  width: '100%', 
  justifyContent: 'center', 
  display: '-webkit-box',
  WebkitLineClamp: 4, // limits to a max of 4 lines
  WebkitBoxOrient: 'vertical',
  padding:"8px",
}

const flashcardDisplaysx = {
  borderRadius: '1.8rem',
  fontSize: '16px',
  fontWeight: 600,
  alignItems: 'center',
  justifyContent: 'center',
  height: '25rem',
  userSelect: 'none',
  padding:"5rem",
  paddingTop:"1rem",
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [flipped, setFlipped] = useState<boolean[]>([]);

  useEffect(() => {
    setFlipped(new Array(slides.length).fill(false));
  }, [slides.length]);
  
  const handleCardClick = (index: number) => {
    setFlipped((prev) => ({
        ...prev,
        [index]: !prev[index]
    }))
  };

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
      }}
    >
      <PrevButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
      />
      <section className="embla" style={{ width: '60vw', margin: '20px'}}>
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((flashcard, index) => (
              <div className="embla__slide" key={index}>
                  {/* FLASHCARD CODE */}
                  <CardActionArea
                    key={index}
                    onClick={() => {
                      handleCardClick(index);
                    }}
                    disableRipple
                    sx={{
                      ...flashcardDisplaysx,
                        '&:focus': {
                            outline: 'none',  // Disable the default focus outline
                            boxShadow: 'none', // Disable the focus ring
                        },
                        background: 'none',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.04)', // Scale up the card on hover
                        },
                    }}
                >
                    <CardContent
                        sx={{
                            borderRadius: '8px',
                            padding: "0",
                            minWidth:"40vw",
                        }}
                    >
                        <Box sx={{
                            perspective: "1000px",
                            '& > div': {
                                transition: 'transform 0.3s',
                                transformStyle: 'preserve-3d',
                                position: 'relative',
                                width: "100%",
                                height: "23rem",
                                borderRadius:"1.8rem",
                                transform: flipped[index] ? 'rotateX(180deg)' : 'rotateX(0deg)',
                                background: flipped[index] ? 'linear-gradient(180deg, #B0C4DE, #FAFAFA)'
                                : 'linear-gradient(180deg, #FAFAFA, #B0C4DE)',
                            },
                            '& > div > div': {
                                position: 'absolute',
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                display: 'flex',
                                justifyContent: 'center',
                                padding: 2,
                                boxSizing: 'border-box',
                                overflow: 'auto',
                                borderRadius:"1.8rem",
                                background: flipped[index] ? 'linear-gradient(180deg, #FAFAFA, #B0C4DE)'
                                : 'linear-gradient(180deg, #B0C4DE, #FAFAFA)',
                            },
                            '& > div > div:nth-of-type(2)': {
                                transform: 'rotateX(180deg)',
                            }
                        }}>
                            <div style={{
                                textAlign:"center",
                            }}>
                                <div>
                                    <Typography variant="h5" component="div" sx={{...flashcardsx}}>
                                        {flashcard.front_text}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="h5" component="div" sx={{...flashcardsx}}>
                                    {flashcard.back_text}
                                    </Typography>
                                </div>
                            </div>
                        </Box>
                    </CardContent>
                  </CardActionArea>





                  {/** END FLASHCARD CODE */}
                {/* </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>
      <NextButton
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        style={{ margin: 'auto 0' }}
      />
    </div>
  )
}

export default EmblaCarousel
