"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
    Globe,
    Twitter,
    Instagram,
    Edit,
    Car,
    ExternalLink,
    ArrowUpRight,
    Trophy,
    Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface SponsorProfileProps {
    sponsor: {
        tokenId: string;
        name: string;
        bio?: string;
        logo?: string;
        website?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
        vehicleId: string;
        vehicleName: string;
        tier?: string;
        slotNumber?: number;
        mintedOn?: string;
        mintPrice?: number;
        openSeaUrl?: string;
        promoLinks?: Array<{
            label: string;
            description?: string;
            url: string;
        }>;
        metrics?: Array<{ label: string; value: string; hint?: string }>;
    };
    isOwner: boolean;
    onManage: () => void;
}

export function SponsorProfile({ sponsor, isOwner, onManage }: SponsorProfileProps) {
    const promoLinks = sponsor.promoLinks || [];
    const metrics = sponsor.metrics || [];

    return (
        <div className="space-y-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#0f0f0f] relative">
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(0,218,162,0.3),transparent)]" />
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_0%,rgba(245,172,39,0.35),transparent)]" />
                </div>
                <CardContent className="relative pt-16 pb-6 px-6 space-y-6">
                    <div className="absolute -top-16 left-6 w-32 h-32 rounded-xl border-4 border-black bg-zinc-900 overflow-hidden">
                        {sponsor.logo ? (
                            <Image src={sponsor.logo} alt={sponsor.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-700">
                                {sponsor.name.substring(0, 2)}
                            </div>
                        )}
                    </div>

                    <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
                        {isOwner && (
                            <Button size="sm" variant="outline" onClick={onManage}>
                                <Edit className="w-4 h-4 mr-2" />
                                Manage
                            </Button>
                        )}
                        {sponsor.openSeaUrl && (
                            <a href={sponsor.openSeaUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    OpenSea
                                </Button>
                            </a>
                        )}
                        <Link href={`/vehicles/${sponsor.vehicleId}`}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-black">
                                <Car className="w-4 h-4 mr-2" />
                                Vehicle
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {sponsor.tier && (
                                <Badge className="bg-primary/20 text-primary border-primary/40 uppercase tracking-wide">
                                    {sponsor.tier} Tier
                                </Badge>
                            )}
                            {typeof sponsor.slotNumber === "number" && (
                                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                    Slot #{sponsor.slotNumber}
                                </Badge>
                            )}
                            <Badge className="bg-white/5 text-white border-white/10">
                                Token #{sponsor.tokenId}
                            </Badge>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{sponsor.name}</h1>
                            <p className="text-zinc-400 mb-4 max-w-2xl">{sponsor.bio || "Sponsor profile coming soon."}</p>
                            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                                Active sponsor of
                            </p>
                            <Link href={`/vehicles/${sponsor.vehicleId}`} className="inline-flex items-center gap-2 text-sm text-primary font-semibold">
                                {sponsor.vehicleName}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

        {/* Link Row */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                >
                                    <Globe className="w-4 h-4" />
                                    Website
                                </a>
                            )}
                            {sponsor.twitter && (
                                <a
                                    href={sponsor.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    <Twitter className="w-4 h-4" />
                                    Twitter
                                </a>
                            )}
                            {sponsor.instagram && (
                                <a
                                    href={sponsor.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                                >
                                    <Instagram className="w-4 h-4" />
                                    Instagram
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatTile
                            label="Mint Price"
                            value={sponsor.mintPrice ? `$${sponsor.mintPrice} USDC` : "TBD"}
                            icon={<Trophy className="w-4 h-4 text-yellow-400" />}
                        />
                        <StatTile
                            label="Minted"
                            value={sponsor.mintedOn || "Pending"}
                            icon={<Sparkles className="w-4 h-4 text-primary" />}
                        />
                        <StatTile
                            label="Vehicle"
                            value={sponsor.vehicleName}
                            icon={<Car className="w-4 h-4 text-white/70" />}
                        />
                        <StatTile
                            label="Token ID"
                            value={`#${sponsor.tokenId}`}
                            icon={<ExternalLink className="w-4 h-4 text-white/70" />}
                        />
                    </div>

                    {metrics.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {metrics.map((metric) => (
                                <div key={metric.label} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                                        {metric.label}
                                    </p>
                                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                                    {metric.hint && (
                                        <p className="text-[11px] text-zinc-400">{metric.hint}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {promoLinks.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-[0.2em]">
                                Promo Links
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {promoLinks.map((promo) => (
                                    <a
                                        key={promo.label}
                                        href={promo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-primary/50 transition-colors"
                                    >
                                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                                            {promo.label}
                                            <ArrowUpRight className="w-4 h-4" />
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-1">{promo.description || promo.url}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {sponsor.photos && sponsor.photos.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                            Activation Gallery
                        </h3>
                        <span className="text-xs text-zinc-500">{sponsor.photos.length} assets</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sponsor.photos.map((photo, idx) => (
                            <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                                <Image src={photo} alt={`Sponsor photo ${idx + 1}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatTile({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wide">
                {icon}
                {label}
            </div>
            <p className="text-lg font-semibold text-white leading-tight">{value}</p>
        </div>
    );
}
