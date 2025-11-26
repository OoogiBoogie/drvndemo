"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { 
    Loader2, Sparkles, Trophy, Check, Plus, X, 
    ChevronRight, Share2, ExternalLink, Coins, Car
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

type Step = "select-stage" | "customize-offers" | "processing" | "success";

interface StageOption {
    id: number;
    name: string;
    description: string;
    wrapCarToken: number;
    wrapCarTokenBonus: number;
    wrapBSTR: number;
    upgradeFee: number;
    mintPrice: number;
    totalRevenue: number;
    royalty: number;
    netRevenue: number;
    color: string;
}

interface CustomOffer {
    id: string;
    title: string;
    description: string;
}

const STAGE_OPTIONS: StageOption[] = [
    {
        id: 1,
        name: "Starter",
        description: "Perfect for getting started",
        wrapCarToken: 1_000_000,
        wrapCarTokenBonus: 100_000,
        wrapBSTR: 10_000,
        upgradeFee: 25,
        mintPrice: 250,
        totalRevenue: 3500,
        royalty: 175,
        netRevenue: 3325,
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: 2,
        name: "Pro",
        description: "For serious car enthusiasts",
        wrapCarToken: 5_000_000,
        wrapCarTokenBonus: 1_000_000,
        wrapBSTR: 50_000,
        upgradeFee: 100,
        mintPrice: 1000,
        totalRevenue: 14000,
        royalty: 700,
        netRevenue: 13300,
        color: "from-purple-500 to-pink-500",
    },
    {
        id: 3,
        name: "Elite",
        description: "Maximum earning potential",
        wrapCarToken: 10_000_000,
        wrapCarTokenBonus: 10_000_000,
        wrapBSTR: 100_000,
        upgradeFee: 250,
        mintPrice: 2500,
        totalRevenue: 35000,
        royalty: 1750,
        netRevenue: 33250,
        color: "from-yellow-500 to-orange-500",
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
    const [processingStep, setProcessingStep] = useState(0);
    const [createdCollection, setCreatedCollection] = useState<{
        contractAddress: string;
        mintPrice: number;
    } | null>(null);

    if (!isOpen) return null;

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
        setProcessingStep(0);

        const steps = [
            "Approving token wrap...",
            "Wrapping tokens...",
            "Paying creation fee...",
            "Deploying collection...",
        ];

        for (let i = 0; i < steps.length; i++) {
            setProcessingStep(i);
            await new Promise(resolve => setTimeout(resolve, 1200));
        }

        const mockCollection = {
            contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
            maxSupply: 14,
            mintPrice: selectedStage.mintPrice,
            stage: selectedStage.id,
        };

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
    };

    const handleShare = (platform: string) => {
        const text = `Just launched a sponsorship collection for my ${vehicleName}! Mint a spot for $${createdCollection?.mintPrice} USDC on @DRVN_VHCLS`;
        
        let url = "";
        if (platform === "farcaster") {
            url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
        } else if (platform === "x") {
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        }
        
        if (url) {
            window.open(url, "_blank");
        }
    };

    const handleClose = () => {
        setStep("select-stage");
        setSelectedStage(null);
        setStandardOffers(STANDARD_OFFERS);
        setCustomOffers([]);
        setCreatedCollection(null);
        setProcessingStep(0);
        onClose();
    };

    const getSelectedOfferCount = () => {
        return standardOffers.filter(o => o.checked).length + customOffers.length;
    };

    const processingSteps = [
        { label: "Approving tokens", icon: "🔓" },
        { label: "Wrapping tokens", icon: "🔄" },
        { label: "Paying fee", icon: "💳" },
        { label: "Deploying", icon: "🚀" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
            
            <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
                
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>

                {step === "select-stage" && (
                    <div className="relative p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Create Sponsorship Collection</h2>
                            <p className="text-zinc-400">{vehicleName} • ${vehicleTicker}</p>
                        </div>

                        <p className="text-center text-sm text-zinc-400 mb-6">
                            Choose a tier that matches your goals. Higher tiers mean higher mint prices and more revenue.
                        </p>

                        <div className="space-y-4 mb-8">
                            {STAGE_OPTIONS.map((stage) => (
                                <button
                                    key={stage.id}
                                    onClick={() => handleStageSelect(stage)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                                        selectedStage?.id === stage.id
                                            ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg`}>
                                                {selectedStage?.id === stage.id ? (
                                                    <Check className="w-6 h-6 text-white" />
                                                ) : (
                                                    <span className="text-xl font-bold text-white">{stage.id}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{stage.name}</h3>
                                                <p className="text-sm text-zinc-400">{stage.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">${stage.mintPrice}</p>
                                            <p className="text-xs text-zinc-500">per sponsor</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-black/30">
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Wrap Required</p>
                                            <p className="text-sm text-white font-medium">
                                                {formatNumber(stage.wrapCarToken + stage.wrapCarTokenBonus)} ${vehicleTicker}
                                            </p>
                                            <p className="text-xs text-zinc-400">+ {formatNumber(stage.wrapBSTR)} $BSTR</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Creation Fee</p>
                                            <p className="text-sm text-white font-medium">${stage.upgradeFee} USDC</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Potential Revenue</p>
                                            <p className="text-sm text-green-400 font-bold">${stage.netRevenue.toLocaleString()}</p>
                                            <p className="text-xs text-zinc-500">from 14 mints</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setStep("customize-offers")}
                            disabled={!selectedStage}
                            className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "customize-offers" && selectedStage && (
                    <div className="relative p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setStep("select-stage")}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                            >
                                <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-white">Customize Sponsor Offerings</h2>
                                <p className="text-sm text-zinc-400">What will sponsors receive?</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {standardOffers.map((offer) => (
                                <label
                                    key={offer.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                                        offer.checked 
                                            ? "bg-yellow-500/10 border-2 border-yellow-500/30" 
                                            : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                                    }`}
                                >
                                    <Checkbox
                                        checked={offer.checked}
                                        onCheckedChange={() => handleToggleStandardOffer(offer.id)}
                                        className="w-5 h-5 border-2 border-white/30 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    />
                                    <span className="text-white font-medium">{offer.label}</span>
                                </label>
                            ))}
                            
                            {customOffers.map((offer) => (
                                <div
                                    key={offer.id}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border-2 border-green-500/30"
                                >
                                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{offer.title}</p>
                                        {offer.description && (
                                            <p className="text-sm text-zinc-400">{offer.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCustomOffer(offer.id)}
                                        className="p-1 rounded-full hover:bg-white/10"
                                    >
                                        <X className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {showAddOffer ? (
                            <div className="space-y-4 p-5 rounded-xl bg-white/5 border border-white/10 mb-6">
                                <Input
                                    value={newOfferTitle}
                                    onChange={(e) => setNewOfferTitle(e.target.value)}
                                    placeholder="Offer title (e.g., VIP event access)"
                                    className="bg-black/30 border-white/10 text-white placeholder:text-zinc-500"
                                />
                                <Input
                                    value={newOfferDescription}
                                    onChange={(e) => setNewOfferDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className="bg-black/30 border-white/10 text-white placeholder:text-zinc-500"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleAddCustomOffer}
                                        disabled={!newOfferTitle.trim()}
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowAddOffer(false);
                                            setNewOfferTitle("");
                                            setNewOfferDescription("");
                                        }}
                                        size="sm"
                                        variant="ghost"
                                        className="text-zinc-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddOffer(true)}
                                className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2 text-zinc-400 hover:text-yellow-500 mb-6"
                            >
                                <Plus className="w-5 h-5" />
                                Add Custom Offer
                            </button>
                        )}

                        <div className="p-4 rounded-xl bg-black/30 border border-white/10 mb-6">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-zinc-400">Selected tier:</span>
                                <span className="text-white font-bold">{selectedStage.name} - ${selectedStage.mintPrice}/mint</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Total offers:</span>
                                <span className="text-white font-bold">{getSelectedOfferCount()} items</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleCreate}
                            disabled={getSelectedOfferCount() === 0}
                            className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg"
                        >
                            <Coins className="w-5 h-5 mr-2" />
                            Create Collection for ${selectedStage.upgradeFee}
                        </Button>
                    </div>
                )}

                {step === "processing" && (
                    <div className="relative p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/30">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Creating Collection</h2>
                            <p className="text-zinc-400">Please wait while we set everything up...</p>
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

                {step === "success" && createdCollection && (
                    <div className="relative p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Collection Created!</h2>
                            <p className="text-zinc-400">Your sponsorship collection is now live</p>
                        </div>

                        <div className="p-5 rounded-xl bg-black/30 border border-white/10 mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Vehicle</span>
                                <span className="text-white font-medium">{vehicleName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Mint Price</span>
                                <span className="text-white font-bold">${createdCollection.mintPrice} USDC</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Max Supply</span>
                                <span className="text-white font-medium">14 NFTs</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Contract</span>
                                <a
                                    href={`https://basescan.org/address/${createdCollection.contractAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-yellow-500 hover:underline flex items-center gap-1 font-mono text-sm"
                                >
                                    {createdCollection.contractAddress.slice(0, 8)}...
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        <p className="text-center text-sm text-zinc-400 mb-4">
                            Share your collection to attract sponsors!
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <Button
                                onClick={() => handleShare("farcaster")}
                                variant="outline"
                                className="h-12 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
                            >
                                <Share2 className="w-4 h-4 mr-2 text-purple-500" />
                                Farcaster
                            </Button>
                            <Button
                                onClick={() => handleShare("x")}
                                variant="outline"
                                className="h-12 border-white/20 hover:bg-white/10"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                X / Twitter
                            </Button>
                        </div>

                        <Button
                            onClick={handleClose}
                            className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-medium"
                        >
                            View Collection
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
