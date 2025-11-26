"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Trophy, Plus, Sparkles, Users, DollarSign, Share2, Settings } from "lucide-react";
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
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Create Sponsorship Collection
                    </CardTitle>
                    <p className="text-sm text-zinc-400">
                        Unlock sponsorship opportunities for {vehicleName}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <Users className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                            <p className="text-xs text-zinc-400">14 Sponsor Slots</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
                            <p className="text-xs text-zinc-400">Earn Revenue</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                            <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                            <p className="text-xs text-zinc-400">Brand Partnerships</p>
                        </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-3 text-sm text-zinc-300">
                        <p className="mb-2 font-semibold text-white">How it works:</p>
                        <ul className="space-y-1 text-xs text-zinc-400">
                            <li>• Wrap {vehicleTicker || "car tokens"} + $BSTR to create collection</li>
                            <li>• Sponsors mint NFTs to claim slots on your car</li>
                            <li>• You earn from each mint + secondary sales</li>
                        </ul>
                    </div>
                    
                    <Button
                        onClick={onCreateCollection}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Collection
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    if (!sponsorshipCollection) return null;

    const mintedCount = sponsorshipCollection.mintedCount ?? sponsors.length;
    const availableSlots = Math.max(0, sponsorshipCollection.maxSupply - mintedCount);
    const isSoldOut = availableSlots === 0;

    const slots = Array.from({ length: sponsorshipCollection.maxSupply }, (_, i) => {
        const sponsor = sponsors.find(s => parseInt(s.tokenId) === i + 1); // Assuming tokenIds are 1-14
        return {
            id: i + 1,
            sponsor,
            isAvailable: !sponsor
        };
    });

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-col gap-3 pb-2">
                <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Sponsors
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {isOwner && onShare && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 hover:bg-white/10"
                                onClick={onShare}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            onClick={() => !isSoldOut && onSponsorClick()}
                            disabled={isSoldOut}
                        >
                            {isSoldOut ? "Sold Out" : `Sponsor ${vehicleName}`}
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                        {mintedCount}/{sponsorshipCollection.maxSupply} claimed • {availableSlots} open
                    </span>
                    <span className="text-white font-semibold">
                        ${sponsorshipCollection.mintPrice} USDC each
                    </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{ width: `${(mintedCount / sponsorshipCollection.maxSupply) * 100}%` }}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-2 md:gap-4">
                    {slots.map((slot) => (
                        <div key={slot.id} className="aspect-square">
                            {slot.isAvailable ? (
                                <button
                                    onClick={() => !isSoldOut && onSponsorClick()}
                                    className="w-full h-full rounded-lg border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-yellow-500/50 transition-all flex flex-col items-center justify-center group"
                                    disabled={isSoldOut}
                                >
                                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-yellow-500 mb-1" />
                                    <span className="text-[8px] md:text-[10px] text-zinc-600 group-hover:text-yellow-500/80">
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
                                        className="w-full h-full rounded-lg border border-white/10 bg-zinc-900 overflow-hidden relative hover:border-yellow-500 transition-all"
                                    >
                                        {slot.sponsor?.logo ? (
                                            <Image
                                                src={slot.sponsor.logo}
                                                alt={slot.sponsor.name || "Sponsor"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-500">
                                                {slot.sponsor?.name?.substring(0, 2) || "SP"}
                                            </div>
                                        )}
                                    </button>
                                    {connectedAddress && 
                                     slot.sponsor?.holderAddress.toLowerCase() === connectedAddress.toLowerCase() && (
                                        <button
                                            onClick={() => slot.sponsor && onManageSponsor?.(slot.sponsor)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-colors z-10"
                                            title="Manage Sponsorship"
                                        >
                                            <Settings className="w-3 h-3 text-black" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
