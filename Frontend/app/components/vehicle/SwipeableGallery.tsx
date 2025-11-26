"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeableGalleryProps {
    images: { url: string; isNftImage: boolean }[];
}

export function SwipeableGallery({ images }: SwipeableGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchEndX(null);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEndX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const distance = touchStartX - touchEndX;
        if (distance > 50) {
            nextSlide();
        } else if (distance < -50) {
            prevSlide();
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-[2/1] bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600">
                No Images Available
            </div>
        );
    }

    return (
        <div 
            className="relative w-full aspect-[2/1] group rounded-xl overflow-hidden border border-white/10 bg-black"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Main Image */}
            <div className="relative w-full h-full">
                <Image
                    src={images[currentIndex].url}
                    alt={`Vehicle Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                />

                {/* NFT Badge */}
                {images[currentIndex].isNftImage && (
                    <div className="absolute top-4 right-4 bg-primary/90 text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                        NFT Image
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={prevSlide}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={nextSlide}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    idx === currentIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                                )}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
