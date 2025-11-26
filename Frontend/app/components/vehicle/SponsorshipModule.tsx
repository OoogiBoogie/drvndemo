"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Trophy, Plus, Sparkles, DollarSign, Share2, Settings, Car, Zap, TrendingUp, ChevronRight, Info, HelpCircle, Edit2, Gift } from "lucide-react";
import Image from "next/image";

interface Sponsor {
    tokenId: string;
    logo?: string;
    name?: string;
    holderAddress: string;
}

interface SponsorshipModuleProps {
    vehicleName: string;
    vehicleTicker?: string;
    isOwner?: boolean;
    isUpgraded?: boolean;
    connectedAddress?: string;
    sponsorshipCollection?: {
        contractAddress: string;
        maxSupply: number;
        mintPrice: number;
        mintedCount?: number;
        priceTier?: number;
        sponsorOffer?: string;
    };
    sponsors: Sponsor[];
    onSponsorClick: (slotId?: number) => void;
    onCreateCollection?: () => void;
    onShare?: () => void;
    onManageSponsor?: (sponsor: Sponsor) => void;
    onViewSponsor?: (sponsor: Sponsor) => void;
    onLearnMore?: () => void;
    onEditSponsorship?: () => void;
    onViewOffer?: () => void;
}

export function SponsorshipModule({
    vehicleName,
    vehicleTicker,
    isOwner = false,
    isUpgraded = false,
    connectedAddress,
    sponsorshipCollection,
    sponsors,
    onSponsorClick,
    onCreateCollection,
    onShare,
    onManageSponsor,
    onViewSponsor,
    onLearnMore,
    onEditSponsorship,
    onViewOffer
}: SponsorshipModuleProps) {
    const [showPricingInfo, setShowPricingInfo] = useState(false);
    
    const getPriceTierLabel = (tier?: number) => {
        if (!tier) return "Custom";
        if (tier === 1) return "Tier 1";
        if (tier === 2) return "Tier 2";
        if (tier === 3) return "Tier 3";
        return "Custom";
    };

    if (!sponsorshipCollection && isOwner && isUpgraded) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />
                
                <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Vehicle Sponsorships</h3>
                                <p className="text-sm text-zinc-400">Monetize your vehicle with sponsor slots</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-zinc-300 mb-6">
                        Enable sponsorships to let brands and enthusiasts claim slots on your vehicle. 
                        Sponsors can display their logo, link their socials, and connect with your audience.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onLearnMore}
                            className="flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                        >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Learn More
                        </Button>
                        <Button
                            onClick={onCreateCollection}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-yellow-500/20"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enable Sponsorships
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!sponsorshipCollection && !isOwner) return null;
    if (!sponsorshipCollection) return null;

    const mintedCount = sponsorshipCollection.mintedCount ?? sponsors.length;
    const availableSlots = Math.max(0, sponsorshipCollection.maxSupply - mintedCount);
    const isSoldOut = availableSlots === 0;

    const slots = Array.from({ length: sponsorshipCollection.maxSupply }, (_, i) => {
        const sponsor = sponsors.find(s => parseInt(s.tokenId) === i + 1);
        return {
            id: i + 1,
            sponsor,
            isAvailable: !sponsor
        };
    });

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />
            
            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Sponsors</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <>
                                {onEditSponsorship && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white hover:bg-white/10"
                                        onClick={onEditSponsorship}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                )}
                                {onShare && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white hover:bg-white/10"
                                        onClick={onShare}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase mb-1">Available</p>
                        <p className="text-lg font-bold text-white">
                            {availableSlots} <span className="text-sm text-zinc-400 font-normal">of {sponsorshipCollection.maxSupply}</span>
                        </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-1 mb-1">
                            <p className="text-xs text-zinc-500 uppercase">Price Tier</p>
                            <button 
                                onClick={() => setShowPricingInfo(!showPricingInfo)}
                                className="text-zinc-500 hover:text-primary transition-colors"
                            >
                                <Info className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-lg font-bold text-yellow-500">
                            {getPriceTierLabel(sponsorshipCollection.priceTier)}
                        </p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                        <p className="text-xs text-zinc-500 uppercase mb-1">Sponsor Offer</p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onViewOffer}
                            className="h-7 text-xs border-primary/50 text-primary hover:bg-primary/10"
                        >
                            <Gift className="w-3 h-3 mr-1" />
                            View Offer
                        </Button>
                    </div>
                </div>

                {/* Pricing Info Modal */}
                {showPricingInfo && (
                    <div className="mb-4 p-4 bg-black/60 rounded-xl border border-yellow-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-yellow-500" />
                                Sponsorship Cost Breakdown
                            </h4>
                            <button 
                                onClick={() => setShowPricingInfo(false)}
                                className="text-zinc-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">USDC Fee</span>
                                <span className="text-white font-medium">${sponsorshipCollection.mintPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Token Wrap (BSTR + ${vehicleTicker || "VHCL"})</span>
                                <span className="text-white font-medium">Required</span>
                            </div>
                            <div className="border-t border-white/10 pt-2 mt-2">
                                <p className="text-xs text-zinc-500">
                                    Wrapping tokens ensures commitment and can be unwrapped after sponsorship ends.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sponsor CTA for non-owners */}
                {!isOwner && !isSoldOut && (
                    <div className="mb-4">
                        <Button
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-yellow-500/20"
                            onClick={() => onSponsorClick()}
                        >
                            <Trophy className="w-4 h-4 mr-2" />
                            Become a Sponsor - ${sponsorshipCollection.mintPrice} USDC
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-7 gap-2">
                    {slots.map((slot) => (
                        <div key={slot.id} className="aspect-square">
                            {slot.isAvailable ? (
                                <button
                                    onClick={() => !isSoldOut && onSponsorClick(slot.id)}
                                    className="w-full h-full rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all flex flex-col items-center justify-center group"
                                    disabled={isSoldOut}
                                >
                                    <Plus className="w-4 h-4 text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                                    <span className="text-[10px] text-zinc-600 group-hover:text-yellow-500/80 mt-0.5 font-medium">
                                        #{slot.id}
                                    </span>
                                </button>
                            ) : (
                                <div className="relative w-full h-full group">
                                    <button
                                        onClick={() => {
                                            if (slot.sponsor) {
                                                const isHolder = connectedAddress && 
                                                    slot.sponsor.holderAddress.toLowerCase() === connectedAddress.toLowerCase();
                                                if (isHolder && onManageSponsor) {
                                                    onManageSponsor(slot.sponsor);
                                                } else if (onViewSponsor) {
                                                    onViewSponsor(slot.sponsor);
                                                }
                                            }
                                        }}
                                        className="w-full h-full rounded-xl border-2 border-white/20 bg-zinc-800 overflow-hidden relative hover:border-yellow-500 transition-all shadow-lg"
                                    >
                                        {slot.sponsor?.logo ? (
                                            <Image
                                                src={slot.sponsor.logo}
                                                alt={slot.sponsor.name || "Sponsor"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                                                <span className="text-xs font-bold text-zinc-400">
                                                    {slot.sponsor?.name?.substring(0, 2).toUpperCase() || "SP"}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                    {connectedAddress && 
                                     slot.sponsor?.holderAddress.toLowerCase() === connectedAddress.toLowerCase() && (
                                        <button
                                            onClick={() => slot.sponsor && onManageSponsor?.(slot.sponsor)}
                                            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
                                            title="Manage Sponsorship"
                                        >
                                            <Settings className="w-3.5 h-3.5 text-black" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
