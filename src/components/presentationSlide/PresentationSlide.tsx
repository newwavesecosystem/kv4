import React from 'react'
import { IPresentationSlide } from '~/types'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../ui/carousel'
import Image from 'next/image'

export default function PresentationSlide({ slides }: { slides: Array<IPresentationSlide> }) {
    return (
        <Carousel className="w-full">
            <CarouselContent>
                {slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Image height={20} width={20} alt="slide" src={slide.svgUri} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}
