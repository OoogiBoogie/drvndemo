"use client";

import { Button } from "@/app/components/ui/button";
import { Trophy, Plus, Sparkles, DollarSign, Share2, Settings, Car, Zap, TrendingUp, ChevronRight } from "lucide-react";
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
    };
    sponsors: Sponsor[];
    onSponsorClick: (slotId?: number) => void;
    onCreateCollection?: () => void;
    onShare?: () => void;
    onManageSponsor?: (sponsor: Sponsor) => void;
    onViewSponsor?: (sponsor: Sponsor) => void;
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
    onViewSponsor
}: SponsorshipModuleProps) {
    
    if (!sponsorshipCollection && isOwner && isUpgraded) {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent" />
                
                <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Sponsorship Collection</h3>
                                <p className="text-sm text-yellow-500/80">Unlock revenue from your {vehicleName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                            <Car className="w-5 h-5 text-yellow-500 mb-2" />
                            <p className="text-2xl font-bold text-white">14</p>
                            <p className="text-xs text-zinc-400">Sponsor Slots</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                            <DollarSign className="w-5 h-5 text-green-500 mb-2" />
                            <p className="text-2xl font-bold text-white">$250+</p>
                            <p className="text-xs text-zinc-400">Per Mint</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                            <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                            <p className="text-2xl font-bold text-white">$3.3K+</p>
                            <p className="text-xs text-zinc-400">Total Revenue</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                            <Zap className="w-5 h-5 text-purple-500 mb-2" />
                            <p className="text-2xl font-bold text-white">5%</p>
                            <p className="text-xs text-zinc-400">Secondary Sales</p>
                        </div>
                    </div>

                    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            How It Works
                        </h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-500">1</div>
                                <p className="text-sm text-zinc-300">Wrap ${vehicleTicker || "tokens"} + $BSTR to create collection</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-500">2</div>
                                <p className="text-sm text-zinc-300">Sponsors mint NFTs to claim slots</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-bold text-yellow-500">3</div>
                                <p className="text-sm text-zinc-300">Earn from mints + secondary sales</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onCreateCollection}
                        className="w-full h-14 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all hover:shadow-xl hover:shadow-yellow-500/30"
                    >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Sponsorship Collection
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }
    
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Sponsors</h3>
                            <p className="text-xs text-zinc-400">
                                {mintedCount}/{sponsorshipCollection.maxSupply} claimed • {availableSlots} available
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && onShare && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-zinc-400 hover:text-white hover:bg-white/10"
                                onClick={onShare}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        )}
                        {!isOwner && !isSoldOut && (
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold shadow-lg shadow-yellow-500/20"
                                onClick={() => onSponsorClick()}
                            >
                                Sponsor {vehicleName}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">${sponsorshipCollection.mintPrice}</span>
                        <span className="text-sm text-zinc-400">USDC / slot</span>
                    </div>
                    <div className="h-2 flex-1 mx-4 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                            style={{ width: `${(mintedCount / sponsorshipCollection.maxSupply) * 100}%` }}
                        />
                    </div>
                </div>

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
