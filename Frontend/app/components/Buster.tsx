"use client";

import { useState, useEffect } from "react";
import { DRVN_TOKENS } from "../swap/types/swap-types";
import {
  TrendingUp,
  BarChart3,
  Users,
  Droplets,
  // RefreshCw
} from "lucide-react";
import Image from "next/image";
import { fetchTokenData, TokenData } from "../../lib/token-data";
import { BusterSwapModal } from "./modals/buster-swap-modal";
import { NFTMintGrid } from "./NFTMintCard";
import TotalKeysMinted from "./web3/TotalKeysMinted";
import { HeroHeader } from "./ui/hero-header";

// Add User interface for authentication
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  xHandle?: string;
  profileImage?: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Props interface for the Buster component
 * @param currentUser - The currently authenticated user's data
 * @param isAuthenticated - Boolean indicating if user is authenticated
 */
interface BusterProps {
  currentUser: User | null;
  isAuthenticated: boolean;
}

/**
 * Buster Component
 *
 * This component displays comprehensive information about the BSTR token including:
 * - Hero banner with DRVN ecosystem messaging
 * - Token price in USD and ETH
 * - Market data (Market Cap, 24HR Volume, Holders, Liquidity)
 * - Action buttons (Connect Wallet, Buy, Sell)
 *
 * Data Sources:
 * - Primary: OnChainKit for token info and basic data
 * - Fallback: Alchemy RPC for detailed contract data if needed
 *
 * Features:
 * - Real-time price updates
 * - Market statistics
 * - Interactive trading buttons
 * - Responsive design
 */
export function Buster({ currentUser, isAuthenticated }: BusterProps) {
  // Props are used in the SwapInterface modal below

  // Token data state - start with empty data to show loading states
  const [tokenData, setTokenData] = useState<TokenData>({
    usdPrice: "Loading...",
    ethPrice: "Loading...",
    priceChange: "Loading...",
    marketCap: "Loading...",
    volume24h: "Loading...",
    holders: "Loading...",
    liquidity: "Loading...",
  });

  const [isLoading, setIsLoading] = useState(true);
  // const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Modal state for swap interface
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState<"buy" | "sell">("buy");

  // Fetch token data on component mount and set up real-time refresh
  useEffect(() => {
    loadTokenData();

    // Set up real-time data refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadTokenData();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Load token data using the utility functions
   * This will attempt multiple data sources in order of preference
   */
  const loadTokenData = async () => {
    setIsLoading(true);
    console.log("🔄 Starting to load token data...");

    try {
      const data = await fetchTokenData();
      console.log("✅ Token data received:", data);
      setTokenData(data);
      // setLastUpdated(new Date())
    } catch (error) {
      console.error("❌ Error loading token data:", error);
      // Token data already has fallback values
    } finally {
      setIsLoading(false);
      console.log("🏁 Finished loading token data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Banner Section */}
        <HeroHeader
          title="Buster Club"
          subtitle="Buy, trade, earn, and hold $BSTR to unlock greater benefits, larger rewards, and more voting power within the DRVN DAO."
          backgroundImage="/Cars/BusterHero2.jpg"
        />

        {/* Token Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Token Info and Price */}
          <div className="lg:col-span-1 space-y-4">
            {/* Token Identification and Price */}
            <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
              <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                  {/* Token Icon */}
                  <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#000000] ring-1 ring-white/10">
                      <Image
                        src={DRVN_TOKENS.BSTR.image || ""}
                        alt="BSTR Token"
                        width={64}
                        height={64}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Price Information */}
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-white font-mono mb-1">
                      {isLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : (
                        `$${tokenData.usdPrice}`
                      )}
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      {isLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : (
                        `◆${tokenData.ethPrice}`
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <dl className="-my-3 divide-y divide-white/10 text-sm/6">
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="text-gray-400 font-mono">24hr Change</dt>
                    <dd className="font-medium text-white font-mono">
                      {isLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : (
                        tokenData.priceChange
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSwapType("buy");
                  setShowSwapModal(true);
                }}
                className="auth-choice-btn-primary relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                {/* Green Accent Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-[#00daa2]/20 via-transparent to-[#00daa2]/20 opacity-50"></div>
                <span className="relative z-10 font-mono">Buy</span>
              </button>
              <button
                onClick={() => {
                  setSwapType("sell");
                  setShowSwapModal(true);
                }}
                className="auth-choice-btn-primary relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <span className="relative z-10 font-mono">Sell</span>
              </button>
            </div>
          </div>

          {/* Right Column - Market Data */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
              <div className="px-6 py-5 border-b border-white/10">
                <h2 className="text-xl font-bold text-white font-mono">Market Data</h2>
              </div>

              <div className="px-6 py-5">
                <dl className="-my-3 divide-y divide-white/10 text-sm/6">
                  {/* Market Cap */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <TrendingUp className="w-5 h-5 text-white/60" />
                      Market Cap
                    </dt>
                    <dd className="font-medium text-white font-mono">
                      {isLoading ? "Loading..." : tokenData.marketCap}
                    </dd>
                  </div>

                  {/* 24 HR Volume */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <BarChart3 className="w-5 h-5 text-white/60" />
                      24 HR Volume
                    </dt>
                    <dd className="font-medium text-white font-mono">
                      {isLoading ? "Loading..." : tokenData.volume24h}
                    </dd>
                  </div>

                  {/* Holders */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <Users className="w-5 h-5 text-white/60" />
                      Holders
                    </dt>
                    <dd className="font-medium text-white font-mono">
                      {isLoading ? "Loading..." : tokenData.holders}
                    </dd>
                  </div>

                  {/* Liquidity */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <Droplets className="w-5 h-5 text-white/60" />
                      Liquidity
                    </dt>
                    <dd className="font-medium text-white font-mono">
                      {isLoading ? "Loading..." : tokenData.liquidity}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Founder's Club Keys Section */}
        <div className="mt-8">
          <NFTMintGrid />
        </div>
        <TotalKeysMinted />
      </div>

      {/* Buster Swap Modal */}
      <BusterSwapModal
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        swapType={swapType}
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />
    </div>
  );
}
