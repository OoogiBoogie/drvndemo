"use client";

import { useState } from "react";
import { X, Trophy, Check, Loader2, Share2, ExternalLink, Sparkles, DollarSign, Gift, ChevronRight } from "lucide-react";
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
  vehicleName,
  vehicleImage,
  mintPrice,
  availableSlots,
  maxSupply,
  benefits = [
    "Logo decal on car",
    "Mention in posts",
    "Brand promotion posts"
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
  };

  const handleMint = async () => {
    if (!selectedSlot) return;
    setStep("processing");
    
    const steps = [
      "Connecting to wallet...",
      "Approving USDC transfer...",
      "Minting NFT...",
      "Confirming transaction..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const result = {
      tokenId: selectedSlot,
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
    const text = `Just became a sponsor of ${vehicleName} on @DRVN_VHCLS!`;
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>

        {step === "select" && (
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Become a Sponsor</h2>
              <p className="text-zinc-400">
                Support {vehicleName} and get exclusive benefits
              </p>
            </div>

            {vehicleImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10">
                <Image
                  src={vehicleImage}
                  alt={vehicleName}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-bold text-lg">{vehicleName}</p>
                </div>
              </div>
            )}

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-500" />
                What You Get
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-zinc-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Choose Your Slot</h3>
                <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
                  {availableSlots.length} of {maxSupply} open
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: maxSupply }, (_, i) => i + 1).map((slot) => {
                  const isAvailable = availableSlots.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvailable && handleSelectSlot(slot)}
                      disabled={!isAvailable}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${
                        isSelected
                          ? "border-yellow-500 bg-yellow-500/20 text-yellow-500 shadow-lg shadow-yellow-500/20"
                          : isAvailable
                          ? "border-white/10 bg-white/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-white"
                          : "border-white/5 bg-zinc-800/30 text-zinc-700 cursor-not-allowed"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-6">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Mint Price</p>
                <p className="text-2xl font-bold text-white">${mintPrice} <span className="text-sm font-normal text-zinc-400">USDC</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            <Button
              onClick={() => selectedSlot && setStep("confirm")}
              disabled={!selectedSlot}
              className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSlot ? `Mint Slot #${selectedSlot}` : "Select a Slot"}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h2>
              <p className="text-zinc-400">
                You&apos;re minting Slot #{selectedSlot}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Vehicle</span>
                <span className="text-white font-medium">{vehicleName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Slot Number</span>
                <span className="text-yellow-500 font-bold">#{selectedSlot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Price</span>
                <span className="text-white font-medium">${mintPrice} USDC</span>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-bold text-white">${mintPrice} <span className="text-sm font-normal text-zinc-400">USDC</span></span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep("select")}
                className="flex-1 h-12 border border-white/10 hover:bg-white/5"
              >
                Back
              </Button>
              <Button
                onClick={handleMint}
                className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
              >
                Confirm & Mint
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="relative p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/30">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Minting Your NFT</h2>
              <p className="text-zinc-400">Please wait...</p>
            </div>

            <div className="space-y-3">
              {processingSteps.map((pStep, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    index < processingStep
                      ? "bg-green-500/10 border border-green-500/30"
                      : index === processingStep
                      ? "bg-yellow-500/10 border border-yellow-500/30"
                      : "bg-white/5 border border-transparent"
                  }`}
                >
                  <span className="text-2xl">{pStep.icon}</span>
                  <span className={`flex-1 font-medium ${
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
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome, Sponsor!</h2>
              <p className="text-zinc-400">
                You now hold Slot #{mintResult.tokenId}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Token ID</span>
                <span className="text-white font-mono font-bold">#{mintResult.tokenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Transaction</span>
                <a
                  href={`https://basescan.org/tx/${mintResult.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500 hover:underline flex items-center gap-1 font-mono text-sm"
                >
                  {mintResult.transactionHash.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-5 mb-6 border border-yellow-500/20">
              <p className="text-sm text-zinc-300 mb-4">
                <strong className="text-white">Next Step:</strong> Set up your sponsor profile to display your branding!
              </p>
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
              >
                Set Up Your Profile
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-zinc-400 text-center">Share your sponsorship</p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => handleShare("farcaster")}
                  className="flex-1 h-11 border border-purple-500/30 hover:bg-purple-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2 text-purple-500" />
                  Farcaster
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleShare("x")}
                  className="flex-1 h-11 border border-white/20 hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  X / Twitter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
