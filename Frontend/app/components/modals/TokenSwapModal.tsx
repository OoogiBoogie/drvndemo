"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ArrowDownUp, Coins, ExternalLink, Info } from "lucide-react";

interface TokenSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    address: string;
    ticker: string;
  };
}

export function TokenSwapModal({ isOpen, onClose, token }: TokenSwapModalProps) {
  const [swapDirection, setSwapDirection] = useState<"buy" | "sell">("buy");
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const handleSwapDirectionToggle = () => {
    setSwapDirection(prev => prev === "buy" ? "sell" : "buy");
    setEthAmount("");
    setTokenAmount("");
  };

  const handleEthChange = (value: string) => {
    setEthAmount(value);
    const ethValue = parseFloat(value) || 0;
    setTokenAmount((ethValue * 22222222).toFixed(0));
  };

  const handleTokenChange = (value: string) => {
    setTokenAmount(value);
    const tokenValue = parseFloat(value) || 0;
    setEthAmount((tokenValue / 22222222).toFixed(8));
  };

  const handleSwap = () => {
    window.open(
      `https://app.uniswap.org/swap?chain=base&inputCurrency=ETH&outputCurrency=${token.address}`,
      '_blank'
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Swap ${token.ticker}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Trade {swapDirection === "buy" ? "ETH for" : `$${token.ticker} for`} {swapDirection === "buy" ? `$${token.ticker}` : "ETH"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">
                {swapDirection === "buy" ? "You pay" : "You sell"}
              </span>
              <span className="text-xs text-zinc-500">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={swapDirection === "buy" ? ethAmount : tokenAmount}
                onChange={(e) => swapDirection === "buy" 
                  ? handleEthChange(e.target.value) 
                  : handleTokenChange(e.target.value)
                }
                className="bg-transparent border-none text-2xl font-bold text-white placeholder:text-zinc-600 focus-visible:ring-0"
              />
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg shrink-0">
                {swapDirection === "buy" ? (
                  <>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">E</div>
                    <span className="font-medium">ETH</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="font-medium">${token.ticker}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapDirectionToggle}
              className="bg-zinc-800 hover:bg-zinc-700 rounded-full p-2"
            >
              <ArrowDownUp className="w-4 h-4 text-primary" />
            </Button>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">
                {swapDirection === "buy" ? "You receive" : "You receive"}
              </span>
              <span className="text-xs text-zinc-500">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={swapDirection === "buy" ? tokenAmount : ethAmount}
                onChange={(e) => swapDirection === "buy" 
                  ? handleTokenChange(e.target.value) 
                  : handleEthChange(e.target.value)
                }
                className="bg-transparent border-none text-2xl font-bold text-white placeholder:text-zinc-600 focus-visible:ring-0"
              />
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg shrink-0">
                {swapDirection === "buy" ? (
                  <>
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="font-medium">${token.ticker}</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">E</div>
                    <span className="font-medium">ETH</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-900/30 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Info className="w-3 h-3" />
              <span>Swap will open in Uniswap</span>
            </div>
          </div>

          <Button
            onClick={handleSwap}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-6"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Swap on Uniswap
          </Button>

          <p className="text-xs text-center text-zinc-500">
            Trade ${token.ticker} on Base via Uniswap V3
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
