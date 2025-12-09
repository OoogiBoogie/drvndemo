"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronDown,
  Info,
  Plus,
  Minus,
  TrendingUp,
  Hash,
  Gauge,
  Zap,
  Car,
  Palette,
  Settings,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { marketplaceItems } from "../../components/ui/marketplace-card";
import { useRouter } from "next/navigation";

interface CarDetailClientProps {
  id: string;
}

export function CarDetailClient({ id }: CarDetailClientProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [moreInfoExpanded, setMoreInfoExpanded] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);

  // Find the car data based on the ID
  const car = marketplaceItems.find((item) => item.id === parseInt(id));

  if (!car) {
    return (
      <div className="min-h-screen bg-[#131725] flex items-center justify-center">
        <div className="text-white text-xl">Car not found</div>
      </div>
    );
  }

  // Car images array - for now, use the same image for all angles since we only have one image per car
  const carImages = [
    car.image,
    car.image, // Same image for different angles
    car.image, // Same image for different angles
    car.image, // Same image for different angles
  ];

  // Icon mapping for dynamic specs
  const iconMap: {
    [key: string]: React.ComponentType<{ className?: string }>;
  } = {
    Hash,
    Gauge,
    Car,
    Zap,
    Settings,
    Palette,
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-950 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-[#00daa2] hover:text-[#00daa2]/80 hover:bg-white/5"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>

        <h1 className="text-white text-lg font-medium font-mono tracking-wide">Vehicle Details</h1>

        <div className="w-10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section with Enhanced Background */}
        <div className="bg-gray-950 border border-white/10 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 space-y-6">
            {/* Car Image Section */}
            <div className="relative">
              <div className="relative h-96 bg-linear-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden group">
                <Image
                  src={carImages[currentImageIndex]}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>

                {/* Status Badge - Desktop */}
                <div className="absolute top-4 right-4 hidden lg:block">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                      car.status === "Coming Soon"
                        ? "bg-red-500/90 text-white ring-2 ring-inset ring-red-500/50 shadow-lg"
                        : "bg-green-400/90 text-black ring-2 ring-inset ring-green-400/50 shadow-lg"
                    }`}
                  >
                    {car.status === "Coming Soon" ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {carImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-[#00daa2] w-8 shadow-lg shadow-[#00daa2]/50"
                        : "bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Car Details Section */}
            <div className="space-y-4">
              {/* Year & Brand with Mobile Status */}
              <div className="flex items-center justify-between lg:justify-start gap-4">
                <div className="text-red-400 text-sm font-medium uppercase font-mono tracking-wider">
                  {car.year} {car.brand}
                </div>

                {/* Mobile Status - Only visible on mobile */}
                <div className="lg:hidden flex items-center gap-3">
                  <div className="text-[#00daa2] text-lg font-bold font-mono">{car.price}</div>
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                      car.status === "Coming Soon"
                        ? "bg-red-500/90 text-white ring-2 ring-inset ring-red-500/50 shadow-lg"
                        : "bg-green-400/90 text-black ring-2 ring-inset ring-green-400/50 shadow-lg"
                    }`}
                  >
                    {car.status === "Coming Soon" ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Model Name */}
              <h2 className="text-3xl lg:text-4xl font-bold text-white font-mono leading-tight">
                {car.model.split(" ")[0]}{" "}
                <span className="italic font-normal">{car.model.split(" ").slice(1).join(" ")}</span>
              </h2>

              {/* Collection */}
              <div className="text-gray-300 text-lg font-mono">{car.collection}</div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed font-sans text-base">
                {car.description}
              </p>

              {/* Collapsible Sections */}
              <div className="space-y-3 pt-2">
                {/* More Info Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
                  <button
                    onClick={() => setMoreInfoExpanded(!moreInfoExpanded)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-[#00daa2] hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium font-mono text-sm uppercase tracking-wide">More info</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${moreInfoExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {moreInfoExpanded && (
                    <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed font-sans border-t border-white/10 pt-4">
                      <p>{car.moreInfo}</p>
                    </div>
                  )}
                </div>

                {/* Vehicle Specs Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
                  <button
                    onClick={() => setSpecsExpanded(!specsExpanded)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-[#00daa2] hover:bg-white/5 transition-colors"
                  >
                    <span className="font-medium font-mono text-sm uppercase tracking-wide">Vehicle Specs</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${specsExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {specsExpanded && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-4">
                      <div className="space-y-3">
                        {car.detailedSpecs.map((spec, index) => {
                          const IconComponent = iconMap[spec.icon];
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 px-2 -mx-2 rounded transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-4 w-4 text-[#00daa2] shrink-0" />
                                <span className="text-gray-300 text-sm font-sans">
                                  {spec.label}
                                </span>
                              </div>
                              <span className="text-white font-medium text-sm font-mono">
                                {spec.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Status Section */}
        <div className="bg-gray-950 border border-white/10 rounded-xl overflow-hidden shadow-lg shadow-black/20">
          <div className="p-6 space-y-6">
            {/* Price and Status */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-white font-mono">{car.price}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${
                      car.status === "Coming Soon"
                        ? "bg-red-500/90 text-white ring-2 ring-inset ring-red-500/50 shadow-lg"
                        : "bg-green-400/90 text-black ring-2 ring-inset ring-green-400/50 shadow-lg"
                    }`}
                  >
                    {car.status === "Coming Soon" ? (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        {car.status}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Value and Ownership Table */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs font-sans font-medium uppercase tracking-wide">Market Value</div>
                  <div className="text-white font-bold text-lg font-mono">TBD</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs font-sans font-medium uppercase tracking-wide">Appraised Value</div>
                  <div className="text-white font-bold text-lg font-mono">{car.mv}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs font-sans font-medium uppercase tracking-wide">Spread</div>
                  <div className="text-white font-bold text-lg font-mono">NA</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs font-sans font-medium uppercase tracking-wide">$RS1 Price</div>
                  <div className="text-white font-bold text-lg font-mono">TBA</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs flex items-center gap-1 font-sans font-medium uppercase tracking-wide">
                    RS1 Members
                    <Info className="h-3 w-3" />
                  </div>
                  <div className="text-white font-bold text-lg font-mono">2</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs font-sans font-medium uppercase tracking-wide">Owners</div>
                  <div className="text-white font-bold text-lg font-mono">2</div>
                </div>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="text-center text-gray-400 text-xs font-sans uppercase tracking-wide">
                Buy/Sell only available with USDC.
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="buy-rs1-btn w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                  {/* Button Content */}
                  <div className="relative flex items-center gap-2 z-10">
                    <Plus className="h-4 w-4" />
                    <span>Buy $RS1</span>
                  </div>
                </button>

                <button
                  className="sell-rs1-btn w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                  {/* Button Content */}
                  <div className="relative flex items-center gap-2 z-10">
                    <Minus className="h-4 w-4" />
                    <span>Sell $RS1</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Buy/Sell Buttons - Angled Borders (Left in, Right out) matching disconnect modal */
        .buy-rs1-btn,
        .sell-rs1-btn {
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          position: relative;
        }
      `}</style>
    </div>
  );
}
