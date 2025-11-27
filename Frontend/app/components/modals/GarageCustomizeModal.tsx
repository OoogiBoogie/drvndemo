"use client";

import { useState } from "react";
import { X, Check, Image as ImageIcon, Car } from "lucide-react";
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
}

interface GarageCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgrounds: GarageBackground[];
  cars: CarOverlay[];
  selectedBackgroundId: string;
  selectedCarId: string;
  onBackgroundSelect: (id: string) => void;
  onCarSelect: (id: string) => void;
}

export function GarageCustomizeModal({
  isOpen,
  onClose,
  backgrounds,
  cars,
  selectedBackgroundId,
  selectedCarId,
  onBackgroundSelect,
  onCarSelect,
}: GarageCustomizeModalProps) {
  const [activeTab, setActiveTab] = useState<"backgrounds" | "cars">("backgrounds");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Customize Your Garage</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("backgrounds")}
            className={`flex-1 flex items-center justify-center gap-2 p-4 transition-colors ${
              activeTab === "backgrounds"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-medium">Backgrounds</span>
          </button>
          <button
            onClick={() => setActiveTab("cars")}
            className={`flex-1 flex items-center justify-center gap-2 p-4 transition-colors ${
              activeTab === "cars"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Car className="w-5 h-5" />
            <span className="font-medium">Featured Car</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {activeTab === "backgrounds" && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Select a garage background. NFT backgrounds will be available soon!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => onBackgroundSelect(bg.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedBackgroundId === bg.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={bg.src}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedBackgroundId === bg.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">
                        {bg.name}
                      </p>
                      {bg.isNft && (
                        <span className="text-[10px] text-primary">NFT</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "cars" && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Select which car to feature in your garage display.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cars.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => onCarSelect(car.id)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all bg-zinc-800 ${
                      selectedCarId === car.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={car.src}
                      alt={car.name}
                      className="w-full h-full object-contain p-2"
                    />
                    {selectedCarId === car.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">
                        {car.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-black font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
