"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Coins, TrendingUp, TrendingDown, ExternalLink, Share2, Copy, Check } from "lucide-react";

interface TokenDetailsProps {
    token: {
        address: string;
        ticker: string;
        price?: number;
        mcap?: number;
        change24h?: number;
    };
    vehicleName?: string;
    onSwapClick?: () => void;
}

export function TokenDetails({ token, vehicleName, onSwapClick }: TokenDetailsProps) {
    const [copied, setCopied] = useState(false);
    const isPositive = (token.change24h || 0) >= 0;

    const handleCopyAddress = async () => {
        await navigator.clipboard.writeText(token.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = vehicleName 
            ? `Check out ${vehicleName} on @DRVN_VHCLS! Trading as $${token.ticker} 🚗\n\nSwap now: https://drvn.io/swap/${token.address}`
            : `Trade $${token.ticker} on @DRVN_VHCLS!\n\nhttps://drvn.io/swap/${token.address}`;
        
        if (navigator.share) {
            navigator.share({ text });
        } else {
            window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
                '_blank'
            );
        }
    };

    const handleDexScreener = () => {
        window.open(`https://dexscreener.com/base/${token.address}`, '_blank');
    };

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Coins className="w-5 h-5 text-primary" />
                        ${token.ticker}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className="text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
                <button
                    onClick={handleCopyAddress}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1 mt-1 transition-colors"
                >
                    {token.address.slice(0, 8)}...{token.address.slice(-6)}
                    {copied ? (
                        <Check className="w-3 h-3 text-green-500" />
                    ) : (
                        <Copy className="w-3 h-3" />
                    )}
                </button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1">Price</div>
                        <div className="text-lg font-bold text-white">
                            ${token.price?.toFixed(6) || "0.000000"}
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1">24h</div>
                        <div className={`text-lg font-bold flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(token.change24h || 0).toFixed(1)}%
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1">MCap</div>
                        <div className="text-lg font-bold text-white">
                            ${(token.mcap || 0) >= 1000000 
                                ? `${(token.mcap! / 1000000).toFixed(1)}M`
                                : (token.mcap || 0) >= 1000
                                    ? `${(token.mcap! / 1000).toFixed(1)}K`
                                    : token.mcap?.toLocaleString() || "0"
                            }
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button 
                        onClick={onSwapClick}
                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Swap ${token.ticker}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleDexScreener}
                        className="border-white/10 hover:bg-white/5"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
