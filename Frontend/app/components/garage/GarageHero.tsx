"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface GarageBackground {
  id: string;
  src: string;
  name: string;
  focusY?: number;
  isNft?: boolean;
  nftContract?: string;
  nftTokenId?: string;
}

interface CarOverlay {
  id: string;
  src: string;
  name: string;
  collection: string;
  ticker?: string;
  location: string;
  sharesOwned: number;
  totalShares: number;
  usdValue: number;
  change24h: number;
  offsetX?: number;
}

interface GarageHeroProps {
  backgrounds: GarageBackground[];
  cars: CarOverlay[];
  activeBackgroundIndex?: number;
  activeCarIndex?: number;
  onBackgroundChange?: (index: number) => void;
  onCarChange?: (index: number) => void;
  onCustomize?: () => void;
  isOwner?: boolean;
}

export function GarageHero({
  backgrounds,
  cars,
  activeBackgroundIndex = 0,
  activeCarIndex = 0,
  onBackgroundChange,
  onCarChange,
  onCustomize,
  isOwner = false,
}: GarageHeroProps) {
  const [localCarIndex, setLocalCarIndex] = useState(activeCarIndex);
  const [localBgIndex, setLocalBgIndex] = useState(activeBackgroundIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCarIdx = onCarChange ? activeCarIndex : localCarIndex;
  const currentBgIdx = onBackgroundChange ? activeBackgroundIndex : localBgIndex;

  const activeCar = cars.length > 0 ? cars[currentCarIdx % cars.length] : null;
  const activeBackground = backgrounds.length > 0 
    ? backgrounds[currentBgIdx % backgrounds.length] 
    : null;

  useEffect(() => {
    if (slideDirection) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setSlideDirection(null);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentCarIdx, slideDirection]);

  const showNextCar = useCallback(() => {
    setSlideDirection('left');
    const newIndex = (currentCarIdx + 1) % cars.length;
    if (onCarChange) {
      onCarChange(newIndex);
    } else {
      setLocalCarIndex(newIndex);
    }
  }, [currentCarIdx, cars.length, onCarChange]);

  const showPreviousCar = useCallback(() => {
    setSlideDirection('right');
    const newIndex = (currentCarIdx - 1 + cars.length) % cars.length;
    if (onCarChange) {
      onCarChange(newIndex);
    } else {
      setLocalCarIndex(newIndex);
    }
  }, [currentCarIdx, cars.length, onCarChange]);

  const handleSwipeStart = (x: number) => {
    setTouchStartX(x);
  };

  const handleSwipeEnd = (endX: number) => {
    if (touchStartX === null) return;
    const distance = endX - touchStartX;
    if (distance > 50) {
      showPreviousCar();
    } else if (distance < -50) {
      showNextCar();
    }
    setTouchStartX(null);
  };

  const formatUsd = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  if (!activeCar || !activeBackground) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/5 rounded-3xl p-6">
        <div className="aspect-[16/9] rounded-2xl bg-black/40 flex items-center justify-center">
          <p className="text-white/50">No vehicles in your garage yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/5 rounded-3xl p-4 md:p-6">
      {/* Main Hero Container */}
      <div
        className="hero-container relative w-full aspect-[3/2] rounded-2xl overflow-hidden"
        onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
      >
        {/* Layer 1: Background with rounded corners and clipping */}
        <div className="absolute inset-0 z-[1] rounded-2xl overflow-hidden bg-gray-950">
          <img
            src={activeBackground.src}
            alt={activeBackground.name}
            className="w-full h-full object-cover"
            style={{
              objectPosition: "center 85%",
            }}
          />
        </div>

        {/* Layer 2: Glow Effect Behind Car */}
        <div className="absolute inset-0 z-[2] flex items-end justify-center pointer-events-none overflow-hidden rounded-2xl">
          <div 
            className="absolute bottom-0 w-[80%] h-[50%]"
            style={{
              background: "radial-gradient(ellipse at center bottom, rgba(0, 255, 255, 0.5) 0%, rgba(59, 130, 246, 0.3) 30%, transparent 70%)",
              filter: "blur(40px)",
              transform: "translateY(10%)",
            }}
          />
        </div>

        {/* Layer 3: Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-[3] rounded-2xl bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Layer 4: Content Overlay - Top Info Only */}
        <div className="absolute inset-0 z-[4] p-4 md:p-6 flex flex-col justify-start pointer-events-none">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-white/70 font-mono">
              {activeCar.collection}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-4xl font-bold text-white font-mono">
                {activeCar.name}
              </h2>
              {activeCar.ticker && (
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  ${activeCar.ticker}
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm font-sans">
              {activeCar.location}
            </p>
          </div>
        </div>

        {/* Navigation Arrows - Left & Right sides */}
        <button
          onClick={showPreviousCar}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[6] p-3 bg-black/30 hover:bg-black/50 border border-[#00daa2]/50 hover:border-[#00daa2] rounded-lg transition-all group"
        >
          <ChevronLeft className="w-6 h-6 text-[#00daa2] group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={showNextCar}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[6] p-3 bg-black/30 hover:bg-black/50 border border-[#00daa2]/50 hover:border-[#00daa2] rounded-lg transition-all group"
        >
          <ChevronRight className="w-6 h-6 text-[#00daa2] group-hover:scale-110 transition-transform" />
        </button>

        {/* Customize Button (Owner only) */}
        {isOwner && onCustomize && (
          <button
            onClick={onCustomize}
            className="absolute top-4 right-4 z-[6] p-2 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
            title="Customize Garage"
          >
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        )}

        {/* Layer 5: Car Overlay - Positioned in lower portion of hero with cyan glow and slide animation */}
        <div 
          className="absolute inset-0 z-[5] flex items-end justify-center pointer-events-none overflow-hidden"
          style={{ paddingBottom: '8%' }}
        >
          <img
            key={activeCar.id}
            src={activeCar.src}
            alt={activeCar.name}
            className="max-h-[45%] w-auto max-w-[50%] object-contain pointer-events-auto cursor-pointer hover:scale-105"
            style={{
              filter: "drop-shadow(0 0 35px rgba(0, 255, 255, 1)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.5)) drop-shadow(0 20px 50px rgba(0, 0, 0, 0.8))",
              animation: isAnimating 
                ? slideDirection === 'left' 
                  ? 'slideFromRight 0.4s ease-out forwards'
                  : 'slideFromLeft 0.4s ease-out forwards'
                : 'none',
              transition: 'transform 0.2s ease-out',
            }}
          />
        </div>

      </div>


      {/* Stats Row - Below Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 px-2">
        <div>
          <p className="text-xs uppercase text-white/60 font-mono">
            Shares Owned
          </p>
          <p className="text-lg md:text-xl text-white font-semibold font-mono">
            {activeCar.sharesOwned.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-mono">
            Ownership
          </p>
          <p className="text-lg md:text-xl text-white font-semibold font-mono">
            {((activeCar.sharesOwned / activeCar.totalShares) * 100).toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-mono">
            USD Value
          </p>
          <p className="text-lg md:text-xl text-white font-semibold font-mono">
            {formatUsd(activeCar.usdValue)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-white/60 font-mono">
            24h Move
          </p>
          <p
            className={`text-lg md:text-xl font-semibold font-mono ${
              activeCar.change24h >= 0 ? "text-[#00daa2]" : "text-red-400"
            }`}
          >
            {activeCar.change24h >= 0 ? "+" : ""}
            {activeCar.change24h}%
          </p>
        </div>
      </div>

      {/* Progress Dots Only */}
      <div className="flex items-center justify-end mt-4 px-2">
        <div className="flex items-center gap-2">
          {cars.map((car, index) => (
            <button
              key={car.id}
              aria-label={`View ${car.name}`}
              className={`h-2 rounded-full transition-all ${
                index === currentCarIdx
                  ? "bg-[#00daa2] w-8"
                  : "bg-white/30 w-4 hover:bg-white/50"
              }`}
              onClick={() => {
                if (onCarChange) {
                  onCarChange(index);
                } else {
                  setLocalCarIndex(index);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
