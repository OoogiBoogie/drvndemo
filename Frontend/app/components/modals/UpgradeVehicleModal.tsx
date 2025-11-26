"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Loader2, CheckCircle, AlertCircle, Zap, Coins } from "lucide-react";
import type { VehicleUpgradeResult } from "@/hooks/useVehicleLifecycle";

interface UpgradeVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: string;
    vehicleName: string;
    onUpgradeComplete?: (result: VehicleUpgradeResult) => void;
}

type Step = "select-tier" | "confirm" | "processing" | "success";

const TIERS = [
    {
        id: "bronze",
        name: "Bronze",
        crTokenRequired: 1000,
        bstrRequired: 500,
        mintPrice: 50,
        color: "from-orange-700 to-orange-900",
    },
    {
        id: "silver",
        name: "Silver",
        crTokenRequired: 5000,
        bstrRequired: 2500,
        mintPrice: 100,
        color: "from-gray-400 to-gray-600",
    },
    {
        id: "gold",
        name: "Gold",
        crTokenRequired: 10000,
        bstrRequired: 5000,
        mintPrice: 200,
        color: "from-yellow-500 to-yellow-700",
    },
];

export function UpgradeVehicleModal({
    isOpen,
    onClose,
    vehicleId,
    vehicleName,
    onUpgradeComplete,
}: UpgradeVehicleModalProps) {
    const [step, setStep] = useState<Step>("select-tier");
    const [selectedTier, setSelectedTier] = useState<typeof TIERS[0] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [carTokenTicker, setCarTokenTicker] = useState("");

    const handleUpgrade = async () => {
        if (!selectedTier) return;

        setStep("processing");
        setIsLoading(true);
        setError("");

        try {
            // 1. Approve and wrap tokens (CRtoken + BSTR)
            // This would use wagmi to approve and call TokenWrapper.createSponsorshipCollection
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // 2. Create car token via Clanker API
            // Mock response
            const mockCarToken = {
                ticker: carTokenTicker || "CAR1",
                address: "0xtoken...",
                clankerCastHash: "0xcast...",
            };

            // 3. Get sponsorship collection address from TokenWrapper event
            const mockSponsorshipCollection = {
                contractAddress: "0xsponsorship...",
                tier: selectedTier.id,
                maxSupply: 14,
                mintPrice: selectedTier.mintPrice,
            };

            // 4. Update database
            try {
                const response = await fetch(`/api/vehicles/${vehicleId}/upgrade`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        carToken: mockCarToken,
                        sponsorshipCollection: mockSponsorshipCollection,
                        wrapperTxHash: "0xwrapper...",
                    }),
                });

                if (!response.ok) throw new Error("Failed to upgrade vehicle");
            } catch (apiError) {
                console.warn("Upgrade vehicle fallback", apiError);
            }

            onUpgradeComplete?.({
                tierId: selectedTier.id,
                carToken: {
                    ticker: mockCarToken.ticker,
                    address: mockCarToken.address,
                },
                sponsorshipCollection: mockSponsorshipCollection,
            });

            setStep("success");
        } catch {
            setError("Upgrade failed. Please try again.");
            setStep("confirm");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("select-tier");
        setSelectedTier(null);
        setCarTokenTicker("");
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
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        Monetize Vehicle
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1: Select Tier */}
                {step === "select-tier" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-bold mb-2">Select Sponsorship Tier</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Choose a tier to determine sponsorship NFT mint price and your token requirements
                            </p>

                            <div className="space-y-3">
                                {TIERS.map((tier) => (
                                    <button
                                        key={tier.id}
                                        onClick={() => setSelectedTier(tier)}
                                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedTier?.id === tier.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/10 hover:border-white/20 bg-zinc-800/50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                                {tier.name} Tier
                                            </span>
                                            <span className="text-white font-bold">${tier.mintPrice} USDC</span>
                                        </div>
                                        <div className="text-xs text-zinc-400 space-y-1">
                                            <div>Requires: {tier.crTokenRequired.toLocaleString()} $CRtoken + {tier.bstrRequired.toLocaleString()} $BSTR</div>
                                            <div>Sponsorship NFT Price: ${tier.mintPrice} USDC each</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => setStep("confirm")}
                            disabled={!selectedTier}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {/* Step 2: Confirm */}
                {step === "confirm" && selectedTier && (
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="ticker" className="text-white mb-2 block">
                                Car Token Ticker (Optional)
                            </Label>
                            <Input
                                id="ticker"
                                value={carTokenTicker}
                                onChange={(e) => setCarTokenTicker(e.target.value.toUpperCase())}
                                placeholder="e.g., GT3RS, M3, 911"
                                maxLength={10}
                                className="bg-zinc-800 border-white/10 text-white"
                            />
                            <p className="text-xs text-zinc-500 mt-1">
                                Leave blank for auto-generated ticker
                            </p>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-3">Upgrade Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Vehicle:</span>
                                    <span className="text-white">{vehicleName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Tier:</span>
                                    <span className={`font-bold bg-gradient-to-r ${selectedTier.color} bg-clip-text text-transparent`}>
                                        {selectedTier.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Token Requirements:</span>
                                    <span className="text-white">
                                        {selectedTier.crTokenRequired.toLocaleString()} $CR + {selectedTier.bstrRequired.toLocaleString()} $BSTR
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Sponsorship NFT Price:</span>
                                    <span className="text-white font-bold">${selectedTier.mintPrice} USDC</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Coins className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-400">
                                    <p className="font-bold mb-1">What happens next:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Your tokens will be escrowed in the TokenWrapper contract</li>
                                        <li>A car-specific token will be created via Clanker</li>
                                        <li>A sponsorship NFT collection (14 max supply) will be deployed</li>
                                        <li>Your vehicle will be eligible for sponsorships</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("select-tier")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Upgrade Vehicle
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Processing */}
                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Upgrading Vehicle...
                        </h3>
                        <p className="text-zinc-400 mb-2">
                            Please confirm the transaction in your wallet
                        </p>
                        <p className="text-xs text-zinc-500">
                            This may take a few moments
                        </p>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Vehicle Upgraded!
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            Your vehicle is now monetized and ready for sponsorships
                        </p>
                        <Button
                            onClick={handleClose}
                            className="bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            View Vehicle
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
