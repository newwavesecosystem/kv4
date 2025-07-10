import React from 'react'
import {IPresentationSlide, IPresentationSlidePages} from '~/types'
import { Carousel, CarouselContent, CarouselItem, CarouselPreviousPresentation, CarouselNextPresentation } from '../ui/carousel'
import Image from 'next/image'

export default function PresentationSlide({ slides }: { slides: Array<IPresentationSlidePages> }) {
    return (
        <Carousel className="w-full h-[73vh] bg-white text-center">
            <CarouselContent className="text-center">
                {slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1 text-center">
                            <img className="h-[65vh] w-full" alt="slide" src={slide.svgUri} />
                            <div style={{color:"black"}}>Slide {slide.num}</div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPreviousPresentation />
            {/*<div className="bg-red-700 text-center p-2">Slide 1</div>*/}
            <CarouselNextPresentation />
        </Carousel>
    )
}
