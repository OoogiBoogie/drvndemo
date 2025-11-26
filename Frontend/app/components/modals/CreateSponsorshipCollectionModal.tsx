"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
    Loader2, Trophy, Check, Plus, X, 
    ChevronRight, Share2, ExternalLink, Coins
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
    vehicleName,
    vehicleTicker,
    onCreationComplete,
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
            
            <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
                
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>

                {step === "select-stage" && (
                    <>
                        <div className="relative flex-1 overflow-y-auto p-8 pb-4">
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                                    <Trophy className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-1">Create Sponsorship Collection</h2>
                                <p className="text-zinc-400 text-sm">{vehicleName} • ${vehicleTicker}</p>
                            </div>

                            <p className="text-center text-sm text-zinc-400 mb-5">
                                Choose a tier that matches your goals
                            </p>

                            <div className="space-y-3">
                                {STAGE_OPTIONS.map((stage) => (
                                    <button
                                        key={stage.id}
                                        onClick={() => handleStageSelect(stage)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                                            selectedStage?.id === stage.id
                                                ? "border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10"
                                                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-lg`}>
                                                    {selectedStage?.id === stage.id ? (
                                                        <Check className="w-5 h-5 text-white" />
                                                    ) : (
                                                        <span className="text-lg font-bold text-white">{stage.id}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white">{stage.name}</h3>
                                                    <p className="text-xs text-zinc-400">{stage.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-white">${stage.mintPrice}</p>
                                                <p className="text-[10px] text-zinc-500">per sponsor</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-3 p-2.5 rounded-xl bg-black/30 text-center">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 mb-0.5">Wrap</p>
                                                <p className="text-xs text-white font-medium">
                                                    {formatNumber(stage.wrapCarToken + stage.wrapCarTokenBonus)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 mb-0.5">Fee</p>
                                                <p className="text-xs text-white font-medium">${stage.upgradeFee}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-500 mb-0.5">Revenue</p>
                                                <p className="text-xs text-green-400 font-bold">${stage.netRevenue.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pt-8">
                            <Button
                                onClick={() => setStep("customize-offers")}
                                disabled={!selectedStage}
                                className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </>
                )}

                {step === "customize-offers" && selectedStage && (
                    <>
                        <div className="relative flex-1 overflow-y-auto p-6 pb-4">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setStep("select-stage")}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10"
                                >
                                    <ChevronRight className="w-5 h-5 text-zinc-400 rotate-180" />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Customize Offerings</h2>
                                    <p className="text-sm text-zinc-400">What will sponsors receive?</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {standardOffers.map((offer) => (
                                    <label
                                        key={offer.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                            offer.checked 
                                                ? "bg-yellow-500/10 border-2 border-yellow-500/30" 
                                                : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                                        }`}
                                    >
                                        <div 
                                            onClick={() => handleToggleStandardOffer(offer.id)}
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                                                offer.checked 
                                                    ? "bg-yellow-500 border-yellow-500" 
                                                    : "border-white/30"
                                            }`}
                                        >
                                            {offer.checked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-white font-medium text-sm">{offer.label}</span>
                                    </label>
                                ))}
                                
                                {customOffers.map((offer) => (
                                    <div
                                        key={offer.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border-2 border-green-500/30"
                                    >
                                        <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{offer.title}</p>
                                            {offer.description && (
                                                <p className="text-xs text-zinc-400">{offer.description}</p>
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
                                <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
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
                                    className="w-full p-3 rounded-xl border-2 border-dashed border-white/20 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2 text-zinc-400 hover:text-yellow-500 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Custom Offer
                                </button>
                            )}
                        </div>

                        <div className="relative sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent p-6 pt-4 space-y-4">
                            <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">{selectedStage.name} • {getSelectedOfferCount()} offers</span>
                                    <span className="text-white font-bold">${selectedStage.mintPrice}/mint</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreate}
                                disabled={getSelectedOfferCount() === 0}
                                className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg shadow-lg shadow-yellow-500/20"
                            >
                                <Coins className="w-5 h-5 mr-2" />
                                Create Collection for ${selectedStage.upgradeFee}
                            </Button>
                        </div>
                    </>
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
