"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Sponsor {
    tokenId: string;
    logo?: string;
    name?: string;
    holderAddress: string;
}

interface SponsorshipModuleProps {
    vehicleName: string;
    sponsorshipCollection?: {
        contractAddress: string;
        maxSupply: number;
        mintPrice: number;
        mintedCount?: number;
    };
    sponsors: Sponsor[];
    onSponsorClick: () => void;
}

export function SponsorshipModule({
    vehicleName,
    sponsorshipCollection,
    sponsors,
    onSponsorClick
}: SponsorshipModuleProps) {
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
                    <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                        onClick={() => !isSoldOut && onSponsorClick()}
                        disabled={isSoldOut}
                    >
                        {isSoldOut ? "Sold Out" : `Sponsor ${vehicleName}`}
                    </Button>
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
                                <Link href={`/sponsors/${slot.sponsor?.tokenId}`}>
                                    <div className="w-full h-full rounded-lg border border-white/10 bg-zinc-900 overflow-hidden relative group hover:border-yellow-500 transition-all">
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
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
