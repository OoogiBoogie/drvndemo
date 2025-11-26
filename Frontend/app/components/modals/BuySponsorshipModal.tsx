"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Trophy } from "lucide-react";
import Image from "next/image";
import type { SponsorshipPurchaseResult } from "@/hooks/useVehicleLifecycle";

interface BuySponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: string;
    vehicleName: string;
    vehicleImage: string;
    mintPrice: number;
    availableSlots: number;
    onPurchaseSuccess?: (result: SponsorshipPurchaseResult) => void;
}

type Step = "confirm" | "processing" | "success";

export function BuySponsorshipModal({
    isOpen,
    onClose,
    vehicleId,
    vehicleName,
    vehicleImage,
    mintPrice,
    availableSlots,
    onPurchaseSuccess,
}: BuySponsorshipModalProps) {
    const [step, setStep] = useState<Step>("confirm");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [tokenId, setTokenId] = useState<number | null>(null);

    const handlePurchase = async () => {
        setStep("processing");
        setIsLoading(true);
        setError("");

        try {
            // 1. Call smart contract to mint sponsorship NFT
            // This would use wagmi to call SponsorshipNFT.mint
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const mockTxHash = "0xmint...";
            const mockTokenId = 5; // Would come from contract event

            // 2. Create database record
            try {
                const response = await fetch("/api/sponsorship/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        vehicleId,
                        tokenId: mockTokenId.toString(),
                        holderAddress: "0xuser...", // From wallet
                        mintTxHash: mockTxHash,
                        pricePaid: mintPrice,
                    }),
                });

                if (!response.ok) throw new Error("Failed to create sponsorship record");
            } catch (apiError) {
                console.warn("Sponsorship mint fallback", apiError);
            }

            const purchasePayload: SponsorshipPurchaseResult = {
                tokenId: mockTokenId,
                sponsor: {
                    tokenId: mockTokenId.toString(),
                    holderAddress: "0xuser...",
                    name: `Sponsor #${mockTokenId}`,
                },
            };

            onPurchaseSuccess?.(purchasePayload);

            setTokenId(mockTokenId);
            setStep("success");
        } catch (_err) {
            setError("Purchase failed. Please try again.");
            setStep("confirm");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("confirm");
        setTokenId(null);
        setError("");
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        Sponsor Vehicle
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1: Confirm Purchase */}
                {step === "confirm" && (
                    <div className="space-y-6">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                            <Image
                                src={vehicleImage}
                                alt={vehicleName}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">{vehicleName}</h3>
                            <p className="text-sm text-zinc-400">
                                {availableSlots} of 14 sponsorship slots available
                            </p>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h4 className="text-white font-bold mb-3">Sponsorship Benefits</h4>
                            <ul className="space-y-2 text-sm text-zinc-300">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Your logo displayed on vehicle profile</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Dedicated sponsor profile page</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>50% royalties on secondary sales</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Tradeable NFT ownership</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-zinc-400">Mint Price:</span>
                                <span className="text-2xl font-bold text-white">${mintPrice} USDC</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Gas Fee (est.):</span>
                                <span className="text-white">~$2 ETH</span>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-yellow-500 text-sm">
                                <strong>Note:</strong> After purchase, you can customize your sponsor profile with logo, bio, and links.
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handlePurchase}
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-lg py-6"
                        >
                            Purchase Sponsorship
                        </Button>
                    </div>
                )}

                {/* Step 2: Processing */}
                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Minting Sponsorship NFT...
                        </h3>
                        <p className="text-zinc-400">
                            Please confirm the transaction in your wallet
                        </p>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === "success" && (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Sponsorship Acquired!
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            You are now a sponsor of {vehicleName}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    // Navigate to sponsor management page
                                    window.location.href = `/sponsors/${tokenId}`;
                                }}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Manage Sponsorship
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
