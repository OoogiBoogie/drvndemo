"use client";

import { useState } from "react";
import { X, Trophy, Check, Loader2, Share2, ExternalLink, Sparkles, DollarSign, Gift } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { useToast } from "@/app/components/ui/toast-context";

interface MintSponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleName: string;
  vehicleImage?: string;
  mintPrice: number;
  availableSlots: number[];
  maxSupply: number;
  benefits?: string[];
  onMintSuccess?: (result: { tokenId: number; transactionHash: string }) => void;
}

type Step = "select" | "confirm" | "processing" | "success";

export function MintSponsorshipModal({
  isOpen,
  onClose,
  vehicleId,
  vehicleName,
  vehicleImage,
  mintPrice,
  availableSlots,
  maxSupply,
  benefits = [
    "Logo placement on vehicle wrap",
    "Social media mentions",
    "Cross-promotion opportunities",
    "Branded content features"
  ],
  onMintSuccess
}: MintSponsorshipModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [mintResult, setMintResult] = useState<{ tokenId: number; transactionHash: string } | null>(null);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSelectSlot = (slot: number) => {
    setSelectedSlot(slot);
    setStep("confirm");
  };

  const handleMint = async () => {
    setStep("processing");
    
    const steps = [
      "Connecting to wallet...",
      "Approving USDC transfer...",
      "Minting NFT...",
      "Confirming transaction..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    const result = {
      tokenId: selectedSlot!,
      transactionHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
    };
    
    setMintResult(result);
    setStep("success");
    
    addToast({
      type: "success",
      title: "Sponsorship Minted!",
      message: `You're now a sponsor of ${vehicleName}!`,
    });
    
    onMintSuccess?.(result);
  };

  const handleShare = (platform: string) => {
    const text = `Just became a sponsor of ${vehicleName} on @DRVN_VHCLS! 🏎️ #DRVN #Web3`;
    const url = `https://drvn.io/sponsors/${mintResult?.tokenId}`;
    
    let shareUrl = "";
    switch (platform) {
      case "farcaster":
        shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
        break;
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedSlot(null);
    setProcessingStep(0);
    setMintResult(null);
    onClose();
  };

  const processingSteps = [
    { label: "Connecting wallet", icon: "🔗" },
    { label: "Approving USDC", icon: "💵" },
    { label: "Minting NFT", icon: "🎨" },
    { label: "Confirming", icon: "✅" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {step === "select" && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Become a Sponsor</h2>
              <p className="text-zinc-400">
                Choose your sponsorship slot on {vehicleName}
              </p>
            </div>

            {vehicleImage && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
                <Image
                  src={vehicleImage}
                  alt={vehicleName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className="bg-black/30 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-500" />
                Sponsor Benefits
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Select a Slot</h3>
                <span className="text-xs text-zinc-400">
                  {availableSlots.length} of {maxSupply} available
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: maxSupply }, (_, i) => i + 1).map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvailable && handleSelectSlot(slot)}
                      disabled={!isAvailable}
                      className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-medium transition-all ${
                        isAvailable
                          ? "border-white/20 bg-white/5 hover:bg-yellow-500/20 hover:border-yellow-500 text-white"
                          : "border-white/5 bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div>
                <p className="text-sm text-zinc-400">Mint Price</p>
                <p className="text-2xl font-bold text-white">${mintPrice} <span className="text-sm text-zinc-400">USDC</span></p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Mint</h2>
              <p className="text-zinc-400">
                You're about to mint Slot #{selectedSlot}
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Vehicle</span>
                <span className="text-white font-medium">{vehicleName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Slot Number</span>
                <span className="text-white font-medium">#{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Price</span>
                <span className="text-white font-medium">${mintPrice} USDC</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total</span>
                  <span className="text-xl font-bold text-yellow-500">${mintPrice} USDC</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1 border-white/20"
              >
                Back
              </Button>
              <Button
                onClick={handleMint}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Mint for ${mintPrice}
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Minting Your NFT</h2>
              <p className="text-zinc-400">Please wait while we process your transaction</p>
            </div>

            <div className="space-y-3">
              {processingSteps.map((pStep, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    index < processingStep
                      ? "bg-green-500/10 border border-green-500/30"
                      : index === processingStep
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-zinc-800/30 border border-white/5"
                  }`}
                >
                  <span className="text-2xl">{pStep.icon}</span>
                  <span className={`flex-1 ${
                    index <= processingStep ? "text-white" : "text-zinc-500"
                  }`}>
                    {pStep.label}
                  </span>
                  {index < processingStep && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {index === processingStep && (
                    <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "success" && mintResult && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome, Sponsor!</h2>
              <p className="text-zinc-400">
                You now hold Slot #{mintResult.tokenId} on {vehicleName}
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Token ID</span>
                <span className="text-white font-mono">#{mintResult.tokenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Transaction</span>
                <a
                  href={`https://basescan.org/tx/${mintResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-mono text-sm"
                >
                  {mintResult.transactionHash.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-yellow-500/10 rounded-xl p-4 mb-6 border border-yellow-500/20">
              <p className="text-sm text-zinc-300 mb-3">
                <strong className="text-white">Next Step:</strong> Customize your sponsor profile to display your branding on the vehicle!
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              >
                Set Up Your Profile
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-zinc-400 text-center">Share your sponsorship</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleShare("farcaster")}
                  className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Farcaster
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("x")}
                  className="flex-1 border-white/20 hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  X
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
