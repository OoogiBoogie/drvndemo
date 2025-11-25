"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShieldCheck, Zap } from "lucide-react";

interface CarProfileCardProps {
    vehicle: {
        nickname?: string;
        make: string;
        model: string;
        year: number;
        nftImage?: string;
        isUpgraded: boolean;
        location?: string;
        registryId?: string;
        owner?: {
            name: string;
            username?: string;
            avatar?: string;
        };
        followerCount?: number;
        carToken?: {
            ticker: string;
        };
        sponsorshipCollection?: {
            maxSupply: number;
            mintedCount: number;
        };
    };
    onUpgrade?: () => void;
}

export function CarProfileCard({ vehicle, onUpgrade }: CarProfileCardProps) {
    const remainingSponsors = vehicle.sponsorshipCollection
        ? vehicle.sponsorshipCollection.maxSupply - (vehicle.sponsorshipCollection.mintedCount || 0)
        : 0;

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0 relative">
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-primary/50 rounded-xl">
                            <AvatarImage src={vehicle.nftImage} alt={vehicle.nickname} className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 rounded-xl text-xs">
                                {vehicle.year} {vehicle.make}
                            </AvatarFallback>
                        </Avatar>
                        {vehicle.isUpgraded && (
                            <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black">
                                ${vehicle.carToken?.ticker}
                            </div>
                        )}
                    </div>

                    <div className="flex-grow space-y-3 w-full">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white leading-tight">
                                    {vehicle.nickname || `${vehicle.year} ${vehicle.model}`}
                                </h2>
                                <p className="text-zinc-400 text-sm">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                            </div>
                            {!vehicle.isUpgraded && onUpgrade && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                                    onClick={onUpgrade}
                                >
                                    <Zap className="w-4 h-4 mr-1" />
                                    Monetize
                                </Button>
                            )}
                        </div>

                        {(vehicle.owner || vehicle.location || vehicle.registryId) && (
                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                                {vehicle.owner && (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6 border border-white/10">
                                            <AvatarImage src={vehicle.owner.avatar || ""} />
                                            <AvatarFallback>{vehicle.owner.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span>Owned by {vehicle.owner.name}</span>
                                    </div>
                                )}
                                {vehicle.location && (
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-primary" />
                                        <span>{vehicle.location}</span>
                                    </div>
                                )}
                                {vehicle.registryId && (
                                    <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                                        Registry #{vehicle.registryId}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {vehicle.followerCount && (
                            <p className="text-xs text-zinc-500">
                                Followed by {vehicle.followerCount.toLocaleString()} enthusiasts
                            </p>
                        )}
                    </div>
                </div>

                {vehicle.isUpgraded && vehicle.sponsorshipCollection && (
                    <div className="pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                            <span className="uppercase tracking-wider font-bold text-white">Sponsor grid</span>
                            <span>
                                {vehicle.sponsorshipCollection.mintedCount}/{vehicle.sponsorshipCollection.maxSupply} minted
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {[...Array(Math.min(3, vehicle.sponsorshipCollection.mintedCount || 0))].map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border border-black flex items-center justify-center text-[8px] text-white">
                                        S{i + 1}
                                    </div>
                                ))}
                                {(vehicle.sponsorshipCollection.mintedCount || 0) > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[8px] text-white">
                                        +{(vehicle.sponsorshipCollection.mintedCount || 0) - 3}
                                    </div>
                                )}
                            </div>
                            {remainingSponsors > 0 && (
                                <span className="text-xs text-primary font-semibold">
                                    {remainingSponsors} spots open
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
