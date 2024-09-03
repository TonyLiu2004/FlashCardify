import React from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import useEmblaCarousel from 'embla-carousel-react'

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

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

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
        justifyContent: 'center'
      }}
    >
      <PrevButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
      />
      <section className="embla" style={{ width: '60vw', margin: '20px' }}>
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {slides.map((flashcard, index) => (
              <div className="embla__slide" key={index}>
                <div
                  className="embla__slide__number"
                  style={{ 
                    border: '3px solid red', 
                    overflow: "hidden",
                    padding:"20px",
                    fontSize:"16px",
                  }}
                >
                    {flashcard.front_text}
                </div>
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
