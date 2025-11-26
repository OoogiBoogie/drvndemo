"use client";

import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { 
    Coins, TrendingUp, TrendingDown, ExternalLink, Copy, Check, 
    Edit2, Zap
} from "lucide-react";
import Image from "next/image";

interface SocialLinks {
    x?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    farcaster?: string;
    base?: string;
}

interface VehicleTitleModuleProps {
    vehicle: {
        nickname?: string;
        make: string;
        model: string;
        year: number;
        nftImage?: string;
        isUpgraded: boolean;
        registryId?: string;
        carToken?: {
            address: string;
            ticker: string;
            price?: number;
            change24h?: number;
            mcap?: number;
        };
        socialLinks?: SocialLinks;
    };
    owner?: {
        name: string;
        username?: string;
        avatar?: string;
        walletAddress: string;
    };
    isOwner: boolean;
    onOwnerClick?: () => void;
    onSwapClick?: () => void;
    onEditSocialLinks?: () => void;
}

export function VehicleTitleModule({ 
    vehicle, 
    owner, 
    isOwner, 
    onOwnerClick,
    onSwapClick,
    onEditSocialLinks
}: VehicleTitleModuleProps) {
    const [copied, setCopied] = useState(false);
    const isPositive = (vehicle.carToken?.change24h || 0) >= 0;

    const handleCopyAddress = async () => {
        if (!vehicle.carToken?.address) return;
        await navigator.clipboard.writeText(vehicle.carToken.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDexScreener = () => {
        if (vehicle.carToken?.address) {
            window.open(`https://dexscreener.com/base/${vehicle.carToken.address}`, '_blank');
        }
    };

    const abbreviateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const socialIcons: { key: keyof SocialLinks; icon: string; label: string }[] = [
        { key: "x", icon: "𝕏", label: "X/Twitter" },
        { key: "instagram", icon: "📷", label: "Instagram" },
        { key: "youtube", icon: "▶️", label: "YouTube" },
        { key: "tiktok", icon: "♪", label: "TikTok" },
        { key: "farcaster", icon: "🟣", label: "Farcaster" },
        { key: "base", icon: "🔵", label: "Base" },
    ];

    const hasSocialLinks = vehicle.socialLinks && Object.values(vehicle.socialLinks).some(v => v);

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Left Side: NFT Image, Title, Token Ticker, Owner Info, Social Links */}
                    <div className="flex gap-4 flex-1">
                        {/* NFT Image */}
                        <div className="flex-shrink-0">
                            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border-2 border-primary/30">
                                {vehicle.nftImage ? (
                                    <Image
                                        src={vehicle.nftImage}
                                        alt={vehicle.nickname || vehicle.model}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-1 left-1 bg-primary/90 text-black text-[8px] font-bold px-1.5 py-0.5 rounded">
                                    NFT
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1 space-y-2">
                            {/* Title */}
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                    {vehicle.nickname || `${vehicle.year} ${vehicle.model}`}
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                            </div>

                            {/* Token Ticker */}
                            {vehicle.isUpgraded && vehicle.carToken && (
                                <div className="flex items-center gap-2">
                                    <span className="bg-primary/20 text-primary font-bold text-sm px-3 py-1 rounded-full border border-primary/30">
                                        ${vehicle.carToken.ticker}
                                    </span>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="text-xs text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1 transition-colors"
                                    >
                                        {vehicle.carToken.address.slice(0, 6)}...{vehicle.carToken.address.slice(-4)}
                                        {copied ? (
                                            <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Not upgraded indicator */}
                            {!vehicle.isUpgraded && (
                                <div className="flex items-center gap-2">
                                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full border border-zinc-700">
                                        Not Monetized
                                    </span>
                                </div>
                            )}

                            {/* Owner Info - Clickable */}
                            {owner && (
                                <button
                                    onClick={onOwnerClick}
                                    className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors group"
                                >
                                    <Avatar className="w-8 h-8 border border-white/20">
                                        <AvatarImage src={owner.avatar || ""} />
                                        <AvatarFallback className="bg-zinc-800 text-xs">
                                            {owner.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                                            {owner.username || owner.name}
                                        </p>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            {abbreviateAddress(owner.walletAddress)}
                                        </p>
                                    </div>
                                </button>
                            )}

                            {/* Car Social Icons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {hasSocialLinks ? (
                                    <>
                                        {socialIcons.map(({ key, icon, label }) => {
                                            const url = vehicle.socialLinks?.[key];
                                            if (!url) return null;
                                            return (
                                                <a
                                                    key={key}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-sm transition-colors"
                                                    title={label}
                                                >
                                                    {icon}
                                                </a>
                                            );
                                        })}
                                        {isOwner && (
                                            <button
                                                onClick={onEditSocialLinks}
                                                className="w-8 h-8 rounded-full bg-zinc-800/50 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                                title="Edit social links"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </>
                                ) : isOwner ? (
                                    <button
                                        onClick={onEditSocialLinks}
                                        className="text-xs text-zinc-500 hover:text-primary flex items-center gap-1 transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        Add social links
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Token Details (only if upgraded) */}
                    {vehicle.isUpgraded && vehicle.carToken && (
                        <div className="md:w-64 lg:w-72 space-y-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                            {/* Token Stats */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase">Price</div>
                                    <div className="text-sm font-bold text-white">
                                        ${vehicle.carToken.price?.toFixed(4) || "0.00"}
                                    </div>
                                </div>
                                <div className="p-2 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase">24h</div>
                                    <div className={`text-sm font-bold flex items-center justify-center gap-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(vehicle.carToken.change24h || 0).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="p-2 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
                                    <div className="text-[10px] text-zinc-500 uppercase">MCap</div>
                                    <div className="text-sm font-bold text-white">
                                        ${(vehicle.carToken.mcap || 0) >= 1000000 
                                            ? `${((vehicle.carToken.mcap || 0) / 1000000).toFixed(1)}M`
                                            : (vehicle.carToken.mcap || 0) >= 1000
                                                ? `${((vehicle.carToken.mcap || 0) / 1000).toFixed(1)}K`
                                                : (vehicle.carToken.mcap || 0).toLocaleString()
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button 
                                    onClick={onSwapClick}
                                    size="sm"
                                    className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                                >
                                    <Coins className="w-3 h-3 mr-1" />
                                    Swap
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={handleDexScreener}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Right Side: Upgrade prompt (if not upgraded and is owner) */}
                    {!vehicle.isUpgraded && isOwner && (
                        <div className="md:w-64 lg:w-72 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span className="font-bold text-white">Monetize Vehicle</span>
                                </div>
                                <p className="text-xs text-zinc-400 mb-3">
                                    Launch a token for your vehicle and unlock sponsorship features.
                                </p>
                                <Button
                                    size="sm"
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
                                >
                                    <Zap className="w-3 h-3 mr-1" />
                                    Upgrade ($5)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
