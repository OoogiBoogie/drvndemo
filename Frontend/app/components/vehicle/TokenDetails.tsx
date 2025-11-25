"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Coins, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface TokenDetailsProps {
    token: {
        address: string;
        ticker: string;
        price?: number;
        mcap?: number;
        change24h?: number;
    };
}

export function TokenDetails({ token }: TokenDetailsProps) {
    const isPositive = (token.change24h || 0) >= 0;

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-primary" />
                    ${token.ticker} Token
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1">Price</div>
                        <div className="text-lg font-bold text-white">
                            ${token.price?.toFixed(6) || "0.000000"}
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-xs text-zinc-400 mb-1">24h Change</div>
                        <div className={`text-lg font-bold flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(token.change24h || 0)}%
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 col-span-2">
                        <div className="text-xs text-zinc-400 mb-1">Market Cap</div>
                        <div className="text-lg font-bold text-white">
                            ${token.mcap?.toLocaleString() || "0"}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold">
                        Swap {token.ticker}
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        DexScreener
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
