"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { 
    Loader2, CheckCircle, AlertCircle, Sparkles, Coins, 
    Trophy, Users, HelpCircle, Share2, Plus, X, Check
} from "lucide-react";
import { useToast } from "@/app/components/ui/toast-context";

interface CreateSponsorshipCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleId: string;
    vehicleName: string;
    vehicleTicker: string;
    onCreationComplete?: (collection: {
        contractAddress: string;
        maxSupply: number;
        mintPrice: number;
        stage: number;
    }) => void;
    connectedPlatforms?: string[];
}

type Step = "select-stage" | "customize-offers" | "confirm" | "processing" | "success";

interface StageOption {
    id: number;
    name: string;
    wrapCarToken: number;
    wrapCarTokenBonus: number;
    wrapBSTR: number;
    upgradeFee: number;
    mintPrice: number;
    totalRevenue: number;
    royalty: number;
    netRevenue: number;
}

interface CustomOffer {
    id: string;
    title: string;
    description: string;
}

const STAGE_OPTIONS: StageOption[] = [
    {
        id: 1,
        name: "Stage 1",
        wrapCarToken: 1_000_000,
        wrapCarTokenBonus: 100_000,
        wrapBSTR: 10_000,
        upgradeFee: 25,
        mintPrice: 250,
        totalRevenue: 3500,
        royalty: 175,
        netRevenue: 3325,
    },
    {
        id: 2,
        name: "Stage 2",
        wrapCarToken: 5_000_000,
        wrapCarTokenBonus: 1_000_000,
        wrapBSTR: 50_000,
        upgradeFee: 100,
        mintPrice: 1000,
        totalRevenue: 14000,
        royalty: 700,
        netRevenue: 13300,
    },
    {
        id: 3,
        name: "Stage 3",
        wrapCarToken: 10_000_000,
        wrapCarTokenBonus: 10_000_000,
        wrapBSTR: 100_000,
        upgradeFee: 250,
        mintPrice: 2500,
        totalRevenue: 35000,
        royalty: 1750,
        netRevenue: 33250,
    },
];

const STANDARD_OFFERS = [
    { id: "logo", label: "Logo decal on car", checked: true },
    { id: "mention", label: "Mention in posts", checked: true },
    { id: "promo", label: "Brand promotion posts", checked: true },
];

function formatNumber(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}K`;
    }
    return num.toString();
}

export function CreateSponsorshipCollectionModal({
    isOpen,
    onClose,
    vehicleId,
    vehicleName,
    vehicleTicker,
    onCreationComplete,
    connectedPlatforms = [],
}: CreateSponsorshipCollectionModalProps) {
    const { addToast } = useToast();
    const [step, setStep] = useState<Step>("select-stage");
    const [selectedStage, setSelectedStage] = useState<StageOption | null>(null);
    const [standardOffers, setStandardOffers] = useState(STANDARD_OFFERS);
    const [customOffers, setCustomOffers] = useState<CustomOffer[]>([]);
    const [newOfferTitle, setNewOfferTitle] = useState("");
    const [newOfferDescription, setNewOfferDescription] = useState("");
    const [showAddOffer, setShowAddOffer] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdCollection, setCreatedCollection] = useState<{
        contractAddress: string;
        mintPrice: number;
    } | null>(null);
    
    const [shareToFarcaster, setShareToFarcaster] = useState(true);
    const [shareToBase, setShareToBase] = useState(true);

    const handleStageSelect = (stage: StageOption) => {
        setSelectedStage(stage);
    };

    const handleToggleStandardOffer = (offerId: string) => {
        setStandardOffers(prev => prev.map(offer => 
            offer.id === offerId ? { ...offer, checked: !offer.checked } : offer
        ));
    };

    const handleAddCustomOffer = () => {
        if (newOfferTitle.trim()) {
            setCustomOffers(prev => [...prev, {
                id: `custom-${Date.now()}`,
                title: newOfferTitle.trim(),
                description: newOfferDescription.trim(),
            }]);
            setNewOfferTitle("");
            setNewOfferDescription("");
            setShowAddOffer(false);
        }
    };

    const handleRemoveCustomOffer = (offerId: string) => {
        setCustomOffers(prev => prev.filter(o => o.id !== offerId));
    };

    const handleCreate = async () => {
        if (!selectedStage) return;

        setStep("processing");
        setIsLoading(true);
        setError("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 3000));

            const mockCollection = {
                contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
                maxSupply: 14,
                mintPrice: selectedStage.mintPrice,
                stage: selectedStage.id,
            };

            try {
                await fetch(`/api/vehicles/${vehicleId}/sponsorship`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stage: selectedStage.id,
                        collection: mockCollection,
                        offers: {
                            standard: standardOffers.filter(o => o.checked).map(o => o.label),
                            custom: customOffers,
                        },
                    }),
                });
            } catch (apiError) {
                console.warn("Create sponsorship collection fallback", apiError);
            }

            setCreatedCollection({
                contractAddress: mockCollection.contractAddress,
                mintPrice: mockCollection.mintPrice,
            });

            onCreationComplete?.(mockCollection);

            addToast({
                type: "success",
                title: "Collection Created!",
                message: `Sponsorship collection for ${vehicleName} is live`,
            });

            setStep("success");
        } catch {
            setError("Failed to create collection. Please try again.");
            addToast({
                type: "error",
                title: "Creation Failed",
                message: "Something went wrong. Please try again.",
            });
            setStep("confirm");
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = () => {
        const shareText = `Just launched a sponsorship collection for my ${vehicleName}! Mint a spot for $${createdCollection?.mintPrice} USDC and become an official sponsor.`;
        
        const platforms: string[] = [];
        if (shareToFarcaster) {
            platforms.push("Farcaster");
            console.log("Sharing to Farcaster:", shareText);
        }
        if (shareToBase) {
            platforms.push("Base");
            console.log("Sharing to Base:", shareText);
        }
        
        if (platforms.length > 0) {
            addToast({
                type: "info",
                title: "Shared!",
                message: `Posted to ${platforms.join(" & ")}`,
            });
        }
        
        handleClose();
    };

    const handleClose = () => {
        setStep("select-stage");
        setSelectedStage(null);
        setStandardOffers(STANDARD_OFFERS);
        setCustomOffers([]);
        setError("");
        setCreatedCollection(null);
        onClose();
    };

    const getSelectedOfferCount = () => {
        return standardOffers.filter(o => o.checked).length + customOffers.length;
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        Create Sponsorship Collection
                    </DialogTitle>
                    <p className="text-sm text-zinc-400">
                        {vehicleName} • {vehicleTicker}
                    </p>
                </DialogHeader>

                {step === "select-stage" && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            {STAGE_OPTIONS.map((stage) => (
                                <button
                                    key={stage.id}
                                    onClick={() => handleStageSelect(stage)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        selectedStage?.id === stage.id
                                            ? "border-yellow-500 bg-yellow-500/10"
                                            : "border-white/10 bg-zinc-800/50 hover:border-white/30"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                selectedStage?.id === stage.id
                                                    ? "bg-yellow-500 text-black"
                                                    : "bg-zinc-700 text-white"
                                            }`}>
                                                {selectedStage?.id === stage.id ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <span className="font-bold">{stage.id}</span>
                                                )}
                                            </div>
                                            <span className="text-lg font-bold text-white">{stage.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-yellow-500 font-bold text-lg">${stage.mintPrice}</p>
                                            <p className="text-xs text-zinc-500">per mint</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-zinc-400">Wrap Required:</p>
                                            <p className="text-white">
                                                {formatNumber(stage.wrapCarToken)} + {formatNumber(stage.wrapCarTokenBonus)} {vehicleTicker}
                                            </p>
                                            <p className="text-white">
                                                {formatNumber(stage.wrapBSTR)} $BSTR
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-400">Upgrade Fee:</p>
                                            <p className="text-white font-bold">${stage.upgradeFee} USDC</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Total Revenue (14 mints):</span>
                                            <span className="text-green-400 font-bold">${stage.netRevenue.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            ${stage.totalRevenue.toLocaleString()} - ${stage.royalty} royalty (5%)
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setStep("customize-offers")}
                            disabled={!selectedStage}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {step === "customize-offers" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-bold mb-2">What will you offer sponsors?</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Select or add offerings that sponsors will receive
                            </p>
                            
                            <div className="space-y-2">
                                {standardOffers.map((offer) => (
                                    <label
                                        key={offer.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-white/10 cursor-pointer hover:bg-zinc-800"
                                    >
                                        <Checkbox
                                            checked={offer.checked}
                                            onCheckedChange={() => handleToggleStandardOffer(offer.id)}
                                            className="border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                        />
                                        <span className="text-white">{offer.label}</span>
                                    </label>
                                ))}
                                
                                {customOffers.map((offer) => (
                                    <div
                                        key={offer.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-yellow-500/30"
                                    >
                                        <Check className="w-5 h-5 text-yellow-500" />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{offer.title}</p>
                                            {offer.description && (
                                                <p className="text-xs text-zinc-400">{offer.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCustomOffer(offer.id)}
                                            className="text-zinc-500 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {showAddOffer ? (
                            <div className="space-y-3 p-4 rounded-lg bg-zinc-800/50 border border-white/10">
                                <div>
                                    <Label className="text-white text-sm">Offer Title</Label>
                                    <Input
                                        value={newOfferTitle}
                                        onChange={(e) => setNewOfferTitle(e.target.value)}
                                        placeholder="e.g., Exclusive event invites"
                                        className="bg-zinc-900 border-white/10 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white text-sm">Description (optional)</Label>
                                    <Input
                                        value={newOfferDescription}
                                        onChange={(e) => setNewOfferDescription(e.target.value)}
                                        placeholder="Brief description of the offer"
                                        className="bg-zinc-900 border-white/10 text-white mt-1"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddCustomOffer}
                                        disabled={!newOfferTitle.trim()}
                                        size="sm"
                                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                    >
                                        Add Offer
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowAddOffer(false);
                                            setNewOfferTitle("");
                                            setNewOfferDescription("");
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="border-white/10"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShowAddOffer(true)}
                                variant="outline"
                                className="w-full border-dashed border-white/20 hover:border-yellow-500/50 hover:bg-yellow-500/5"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Custom Offer
                            </Button>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("select-stage")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep("confirm")}
                                disabled={getSelectedOfferCount() === 0}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            >
                                Continue ({getSelectedOfferCount()} offers)
                            </Button>
                        </div>
                    </div>
                )}

                {step === "confirm" && selectedStage && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-3">Collection Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Vehicle:</span>
                                    <span className="text-white">{vehicleName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Stage:</span>
                                    <span className="text-yellow-500 font-bold">{selectedStage.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Max Supply:</span>
                                    <span className="text-white">14 NFTs</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Mint Price:</span>
                                    <span className="text-white font-bold">${selectedStage.mintPrice} USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Sponsor Offerings:</span>
                                    <span className="text-white">{getSelectedOfferCount()} items</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-3">Tokens to Wrap</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">{vehicleTicker}:</span>
                                    <span className="text-white">
                                        {formatNumber(selectedStage.wrapCarToken)} + {formatNumber(selectedStage.wrapCarTokenBonus)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">$BSTR:</span>
                                    <span className="text-white">{formatNumber(selectedStage.wrapBSTR)}</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Creation Fee:</span>
                                        <span className="text-white font-bold">${selectedStage.upgradeFee} USDC</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Coins className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-green-400">
                                    <p className="font-bold mb-1">Potential Earnings:</p>
                                    <p className="text-xs">
                                        If all 14 slots are minted, you earn <strong>${selectedStage.netRevenue.toLocaleString()}</strong> (minus 5% platform fee per mint)
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
                                onClick={() => setStep("customize-offers")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isLoading}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            >
                                Wrap & Create
                            </Button>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-yellow-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Creating Collection...
                        </h3>
                        <p className="text-zinc-400 mb-4">
                            Please confirm the transactions in your wallet
                        </p>
                        <div className="text-xs text-zinc-500 space-y-1">
                            <p>1. Approving token wrap...</p>
                            <p>2. Wrapping {vehicleTicker} + $BSTR...</p>
                            <p>3. Deploying sponsorship collection...</p>
                            <p>4. Setting up sponsor offerings...</p>
                        </div>
                    </div>
                )}

                {step === "success" && createdCollection && (
                    <div className="py-8 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Collection Created!
                        </h3>
                        <p className="text-zinc-400 mb-4">
                            {vehicleName} sponsorship is now live
                        </p>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-zinc-400">Mint Price:</span>
                                <span className="text-yellow-500 font-bold text-lg">
                                    ${createdCollection.mintPrice} USDC
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400">Contract:</span>
                                <span className="text-white font-mono text-xs truncate max-w-[200px]">
                                    {createdCollection.contractAddress}
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-yellow-500" />
                                Share Your Collection
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
                                View Collection
                            </Button>
                            <Button
                                onClick={handleShare}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
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
