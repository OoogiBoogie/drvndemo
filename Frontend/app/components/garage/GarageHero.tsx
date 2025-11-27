"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Button } from "../ui/button";

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

  const currentCarIdx = onCarChange ? activeCarIndex : localCarIndex;
  const currentBgIdx = onBackgroundChange ? activeBackgroundIndex : localBgIndex;

  const activeCar = cars.length > 0 ? cars[currentCarIdx % cars.length] : null;
  const activeBackground = backgrounds.length > 0 
    ? backgrounds[currentBgIdx % backgrounds.length] 
    : null;

  const showNextCar = useCallback(() => {
    const newIndex = (currentCarIdx + 1) % cars.length;
    if (onCarChange) {
      onCarChange(newIndex);
    } else {
      setLocalCarIndex(newIndex);
    }
  }, [currentCarIdx, cars.length, onCarChange]);

  const showPreviousCar = useCallback(() => {
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
      {/* Main Hero Container - Wide crop showing mezzanine + mid-ground (red box region) */}
      <div
        className="hero-container relative w-full aspect-[2/1] rounded-2xl overflow-hidden"
        onTouchStart={(e) => handleSwipeStart(e.touches[0].clientX)}
        onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
      >
        {/* Layer 1: Background - Balanced to show mezzanine + floor */}
        <div className="hero-bg absolute inset-0 z-[1] bg-gray-950">
          <img
            src={activeBackground.src}
            alt={activeBackground.name}
            className="w-full h-full object-cover"
            style={{
              objectPosition: "center 70%",
            }}
          />
        </div>

        {/* Layer 2: Car Overlay - Slight offset for proper positioning */}
        <div className="hero-car-layer absolute inset-0 z-[2] flex items-end justify-center">
          <img
            src={activeCar.src}
            alt={activeCar.name}
            className="hero-car"
            style={{
              height: "clamp(140px, 65%, 380px)",
              width: "auto",
              maxWidth: "85%",
              objectFit: "contain",
              transform: activeCar.offsetX ? `translateX(${activeCar.offsetX}%)` : undefined,
              marginBottom: "-5%",
              filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.8))",
            }}
          />
        </div>

        {/* Layer 3: Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Layer 4: Content Overlay */}
        <div className="absolute inset-0 z-[4] p-4 md:p-6 flex flex-col justify-between pointer-events-none">
          {/* Top Info */}
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

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Customize Button (Owner only) */}
        {isOwner && onCustomize && (
          <button
            onClick={onCustomize}
            className="absolute top-4 right-4 z-[5] p-2 bg-black/50 hover:bg-black/70 rounded-lg border border-white/20 transition-colors"
            title="Customize Garage"
          >
            <Settings className="w-5 h-5 text-white/80" />
          </button>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="border border-white/20 text-white/80 hover:text-white"
            onClick={showPreviousCar}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="border border-white/20 text-white/80 hover:text-white"
            onClick={showNextCar}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Dots */}
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
