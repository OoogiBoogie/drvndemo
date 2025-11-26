"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { 
    Loader2, CheckCircle, AlertCircle, Zap, Coins, 
    TrendingUp, Users, Shield, HelpCircle, Share2
} from "lucide-react";
import type { VehicleUpgradeResult } from "@/hooks/useVehicleLifecycle";

interface UpgradeVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: string;
    vehicleName: string;
    vehicleImage?: string;
    onUpgradeComplete?: (result: VehicleUpgradeResult) => void;
    connectedPlatforms?: string[];
}

type Step = "benefits" | "ticker" | "confirm" | "processing" | "success";

const TOKENOMICS = {
    maxSupply: 1_000_000_000,
    creatorReserve: 100_000_000,
    creatorReservePercent: 10,
    platformFeePercent: 5,
};

const BENEFITS = [
    {
        icon: Coins,
        title: "Car Token ($CRtoken)",
        description: "Your vehicle gets its own tradeable ERC20 token on Base",
    },
    {
        icon: Users,
        title: "Sponsorship NFTs",
        description: "Deploy a 14-slot sponsorship collection for brands to mint",
    },
    {
        icon: TrendingUp,
        title: "Trading Revenue",
        description: "Earn from token trading and sponsorship NFT sales",
    },
    {
        icon: Shield,
        title: "Token Bound Account",
        description: "Your vehicle NFT holds all its tokens and assets",
    },
];

export function UpgradeVehicleModal({
    isOpen,
    onClose,
    vehicleId,
    vehicleName,
    vehicleImage,
    onUpgradeComplete,
    connectedPlatforms = [],
}: UpgradeVehicleModalProps) {
    const [step, setStep] = useState<Step>("benefits");
    const [carTokenTicker, setCarTokenTicker] = useState("");
    const [tickerError, setTickerError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdToken, setCreatedToken] = useState<{ ticker: string; address: string } | null>(null);
    
    const [shareToFarcaster, setShareToFarcaster] = useState(true);
    const [shareToBase, setShareToBase] = useState(true);

    const validateTicker = (value: string) => {
        const ticker = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        setCarTokenTicker(ticker);
        
        if (ticker.length < 2) {
            setTickerError("Ticker must be at least 2 characters");
        } else if (ticker.length > 8) {
            setTickerError("Ticker must be 8 characters or less");
        } else if (/^\d/.test(ticker)) {
            setTickerError("Ticker cannot start with a number");
        } else {
            setTickerError("");
        }
    };

    const handleUpgrade = async () => {
        if (!carTokenTicker || tickerError) return;

        setStep("processing");
        setIsLoading(true);
        setError("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 2500));

            const mockCarToken = {
                ticker: `$${carTokenTicker}`,
                address: `0x${Math.random().toString(16).slice(2, 42)}`,
                clankerCastHash: `0x${Math.random().toString(16).slice(2)}`,
            };

            const mockSponsorshipCollection = {
                contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
                maxSupply: 14,
                mintPrice: 100,
            };

            try {
                await fetch(`/api/vehicles/${vehicleId}/upgrade`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        carToken: mockCarToken,
                        sponsorshipCollection: mockSponsorshipCollection,
                        upgradeFee: "5",
                        platformTokenFee: `${TOKENOMICS.maxSupply * (TOKENOMICS.platformFeePercent / 100)}`,
                    }),
                });
            } catch (apiError) {
                console.warn("Upgrade vehicle fallback", apiError);
            }

            setCreatedToken(mockCarToken);

            onUpgradeComplete?.({
                tierId: "monetized",
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

    const handleShare = () => {
        const shareText = `Just upgraded my ${vehicleName} on @DRVN_VHCLS! Now trading as ${createdToken?.ticker} 🚗💰`;
        
        if (shareToFarcaster) {
            console.log("Sharing to Farcaster:", shareText);
        }
        if (shareToBase) {
            console.log("Sharing to Base:", shareText);
        }
        
        handleClose();
    };

    const handleClose = () => {
        setStep("benefits");
        setCarTokenTicker("");
        setTickerError("");
        setError("");
        setCreatedToken(null);
        onClose();
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        Upgrade to Monetize
                    </DialogTitle>
                    <p className="text-sm text-zinc-400">
                        {vehicleName}
                    </p>
                </DialogHeader>

                {step === "benefits" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            {BENEFITS.map((benefit, i) => (
                                <div
                                    key={i}
                                    className="bg-zinc-800/50 rounded-lg p-4 border border-white/5"
                                >
                                    <benefit.icon className="w-8 h-8 text-primary mb-2" />
                                    <h4 className="text-white font-semibold text-sm mb-1">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400">
                                        {benefit.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-r from-primary/20 to-yellow-500/20 rounded-lg p-4 border border-primary/30">
                            <h3 className="text-white font-bold mb-3">$CRtoken Tokenomics</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-400">Max Supply:</span>
                                    <p className="text-white font-bold">1,000,000,000</p>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Creator Reserve:</span>
                                    <p className="text-white font-bold">10% (100M)</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-2">Upgrade Fee</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">$5</span>
                                <span className="text-zinc-400">USDC</span>
                                <span className="text-white mx-2">+</span>
                                <span className="text-xl font-bold text-yellow-500">5%</span>
                                <span className="text-zinc-400">of new token supply</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">
                                Platform receives 50M tokens (5% of 1B supply) to support ecosystem growth
                            </p>
                        </div>

                        <Button
                            onClick={() => setStep("ticker")}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === "ticker" && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor="ticker" className="text-white">
                                    Token Ticker
                                </Label>
                                <div className="group relative">
                                    <HelpCircle className="w-4 h-4 text-zinc-500 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-zinc-800 rounded-lg p-3 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-white/10">
                                        <p className="font-bold mb-1">Ticker Best Practices:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Use 3-5 characters for best recognition</li>
                                            <li>Include vehicle model (e.g., GT3RS, M3CSL)</li>
                                            <li>Keep it memorable and unique</li>
                                            <li>Avoid generic names like CAR or TOKEN</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                <Input
                                    id="ticker"
                                    value={carTokenTicker}
                                    onChange={(e) => validateTicker(e.target.value)}
                                    placeholder="e.g., GT3RS, 911T, SUPRA"
                                    maxLength={8}
                                    className="bg-zinc-800 border-white/10 text-white pl-7 text-lg font-mono uppercase"
                                />
                            </div>
                            {tickerError && (
                                <p className="text-red-400 text-xs mt-1">{tickerError}</p>
                            )}
                            <p className="text-xs text-zinc-500 mt-2">
                                This will be your vehicle&apos;s unique token identifier on Base
                            </p>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-2">Preview</h4>
                            <div className="flex items-center gap-3">
                                {vehicleImage && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-700">
                                        <img 
                                            src={vehicleImage} 
                                            alt={vehicleName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold">{vehicleName}</p>
                                    <p className="text-primary font-mono text-lg">
                                        ${carTokenTicker || "???"}
                                    </p>
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
                                onClick={() => setStep("benefits")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep("confirm")}
                                disabled={!carTokenTicker || !!tickerError}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Create Token
                            </Button>
                        </div>
                    </div>
                )}

                {step === "confirm" && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-3">Upgrade Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Vehicle:</span>
                                    <span className="text-white">{vehicleName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Token Ticker:</span>
                                    <span className="text-primary font-mono font-bold">${carTokenTicker}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Token Supply:</span>
                                    <span className="text-white">1,000,000,000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Your Reserve:</span>
                                    <span className="text-green-400">100,000,000 (10%)</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Upgrade Fee:</span>
                                        <span className="text-white font-bold">$5 USDC</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Platform Fee:</span>
                                        <span className="text-white">50M tokens (5%)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Est. Gas:</span>
                                        <span className="text-white">~$0.10 ETH</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Coins className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-400">
                                    <p className="font-bold mb-1">What happens next:</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Clanker deploys your ${carTokenTicker} token on Base</li>
                                        <li>100M tokens sent to your vehicle&apos;s Token Bound Account</li>
                                        <li>50M tokens sent to DRVN platform wallet</li>
                                        <li>Sponsorship NFT collection (14 slots) is deployed</li>
                                        <li>Your vehicle page shows swap widget and sponsor slots</li>
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
                                onClick={() => setStep("ticker")}
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
                                Pay $5 & Upgrade
                            </Button>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Upgrading Vehicle...
                        </h3>
                        <p className="text-zinc-400 mb-4">
                            Please confirm the transaction in your wallet
                        </p>
                        <div className="text-xs text-zinc-500 space-y-1">
                            <p>1. Processing USDC payment...</p>
                            <p>2. Creating ${carTokenTicker} via Clanker...</p>
                            <p>3. Deploying Sponsorship Collection...</p>
                            <p>4. Updating vehicle metadata...</p>
                        </div>
                    </div>
                )}

                {step === "success" && createdToken && (
                    <div className="py-8 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Vehicle Upgraded!
                        </h3>
                        <p className="text-zinc-400 mb-4">
                            {vehicleName} is now monetized
                        </p>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-zinc-400">Token:</span>
                                <span className="text-primary font-mono font-bold text-lg">
                                    {createdToken.ticker}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Contract:</span>
                                <span className="text-white font-mono text-xs truncate max-w-[200px]">
                                    {createdToken.address}
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-primary" />
                                Share Your Upgrade
                            </h4>
                            <div className="space-y-2">
                                {connectedPlatforms.includes("farcaster") && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shareToFarcaster}
                                            onChange={(e) => setShareToFarcaster(e.target.checked)}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-white text-sm">Share on Farcaster</span>
                                    </label>
                                )}
                                {connectedPlatforms.includes("base") && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shareToBase}
                                            onChange={(e) => setShareToBase(e.target.checked)}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-white text-sm">Share on Base</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                View Vehicle
                            </Button>
                            <Button
                                onClick={handleShare}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share & Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
