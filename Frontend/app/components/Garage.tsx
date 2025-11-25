/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import {
  Car,
  TrendingUp,
  ChevronDown,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import deployedContracts from "../../contracts/deployedContracts";
import ETHPriceDisplay from "../../service/priceService";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusterSwapModal } from "./modals/token-swap-modal";
import { UserProfileCard } from "./profile/UserProfileCard";
import { VHCLRegistry } from "./profile/VHCLRegistry";
import { DigitalCollectibles } from "./profile/DigitalCollectibles";
import { RegisterVehicleModal } from "./modals/RegisterVehicleModal";
import type { VehicleRegistrationResult } from "@/hooks/useVehicleLifecycle";

/**
 * Garage Component (Public Profile)
 *
 * This component displays the user's public profile and garage with:
 * - User Profile Card (Bio, Socials, Stats)
 * - Vehicle Collection stats (RWA shares)
 * - VHCL Registry (Registered Vehicles)
 * - Digital Collectibles (Ecosystem NFTs)
 * - Assets Vault (Wallet Balance - Owner Only)
 */
interface RwaHolding {
  id: string;
  name: string;
  collection: string;
  sharesOwned: number;
  totalShares: number;
  usdValue: number;
  change24h: number;
  image: string;
  location: string;
}

interface GarageProps {
  currentUser: any;
  isAuthenticated: boolean;
}

export function Garage({ currentUser, isAuthenticated }: GarageProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeHoldingIndex, setActiveHoldingIndex] = useState(0);
  const [isCollectionExpanded, setIsCollectionExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Determine if the viewer is the owner of the profile
  const isOwner = true; // defaulting to true for the main Garage view

  const rwaHoldings: RwaHolding[] = currentUser?.rwaHoldings || [
    {
      id: "rwa-gt3",
      name: "Porsche 911 GT3 RS",
      collection: "Paul Walker Legacy Set",
      sharesOwned: 1250,
      totalShares: 10000,
      usdValue: 27500,
      change24h: 2.4,
      image: "/Cars/Porsche911.jpg",
      location: "Los Angeles, CA",
    },
    {
      id: "rwa-r34",
      name: "Nissan R34 GT-R",
      collection: "Skyline Legends",
      sharesOwned: 890,
      totalShares: 8000,
      usdValue: 18200,
      change24h: -1.1,
      image: "/Cars/R34Garage.jpg",
      location: "Tokyo, JP",
    },
    {
      id: "rwa-nsx",
      name: "Honda NSX Type S",
      collection: "Track Icons",
      sharesOwned: 640,
      totalShares: 7500,
      usdValue: 15980,
      change24h: 0.9,
      image: "/Cars/NSXGarage.jpg",
      location: "Miami, FL",
    },
  ];

  const activeHolding =
    rwaHoldings.length > 0
      ? rwaHoldings[activeHoldingIndex % rwaHoldings.length]
      : null;

  // Mock registered vehicles for demo
  const [registeredVehicles, setRegisteredVehicles] = useState<any[]>([
    {
      _id: "1",
      nickname: "Black Widow",
      make: "Porsche",
      model: "911 GT3 RS",
      year: 2024,
      images: [
        { url: "/Cars/Porsche911.jpg", isNftImage: true }
      ],
      isUpgraded: true,
      carToken: {
        ticker: "GT3RS"
      }
    },
  ]);

  // Mock user profile for demo
  const mockUserProfile = {
    _id: "demo-user-id",
    username: currentUser?.username || "drvn_enthusiast",
    displayName: currentUser?.displayName || "DRVN Enthusiast",
    bio: currentUser?.bio || "Passionate about cars and Web3 🏎️",
    profileImage: currentUser?.profileImage || "https://github.com/shadcn.png",
    walletAddress: address || "0x0000000000000000000000000000000000000000",
    socialLinks: currentUser?.socialLinks || {
      base: "base.org/drvn",
      x: "@drvn_platform",
      instagram: "@drvn",
    },
    followerCount: currentUser?.followerCount || 1234,
    followingCount: currentUser?.followingCount || 567,
  };

  // Handlers
  const handleEditProfile = () => {
    router.push("/settings");
  };

  const handleRegisterVehicle = () => {
    setShowRegisterModal(true);
  };

  const handleRegistrationSuccess = (result: VehicleRegistrationResult) => {
    const normalizedImages = result.images.map((url) => ({
      url: url.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url,
      isNftImage: true,
    }));

    setRegisteredVehicles((prev) => [
      ...prev,
      {
        _id: result.vehicleId,
        nickname: result.nickname,
        make: result.factorySpecs.make,
        model: result.factorySpecs.model,
        year: result.factorySpecs.year,
        images: normalizedImages,
        isUpgraded: false,
      },
    ]);
  };

  const handleFollow = () => {
    console.log("Follow clicked");
    // Would call /api/users/[id]/follow
  };

  const showPreviousHolding = () => {
    setActiveHoldingIndex((prev) =>
      prev === 0 ? rwaHoldings.length - 1 : prev - 1,
    );
  };

  const showNextHolding = () => {
    setActiveHoldingIndex((prev) => (prev + 1) % rwaHoldings.length);
  };

  const handleSwipeStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchEndX(null);
  };

  const handleSwipeMove = (clientX: number) => {
    setTouchEndX(clientX);
  };

  const handleSwipeEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      showNextHolding();
    } else if (distance < -50) {
      showPreviousHolding();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };


  // Contract addresses
  const usdcConfig = deployedContracts[8453].USDC;
  const usdcAddress = usdcConfig.address as `0x${string}`;

  // Fetch real wallet balances using wagmi hooks
  const { data: usdcBalanceData } = useReadContract({
    address: usdcAddress,
    abi: usdcConfig.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  const { data: ethBalanceData } = useBalance({
    address: address,
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Calculate total portfolio value
  const usdcBalance = usdcBalanceData
    ? formatUnits(usdcBalanceData as unknown as bigint, 6)
    : "0";
  const ethBalance = ethBalanceData
    ? formatUnits(ethBalanceData.value, 18)
    : "0";

  // For demo purposes, assuming 1 ETH = $3000 (you can integrate with a price API later)
  const ethPrice = 3000;
  const ethValue = parseFloat(ethBalance) * ethPrice;
  const usdcValue = parseFloat(usdcBalance);
  const totalValue = (ethValue + usdcValue).toFixed(2);

  const totalCollectionValue = rwaHoldings.reduce(
    (sum, holding) => sum + holding.usdValue,
    0,
  );
  const weightedChange = totalCollectionValue
    ? rwaHoldings.reduce(
        (sum, holding) => sum + holding.usdValue * holding.change24h,
        0,
      ) / totalCollectionValue
    : 0;
  const formatUsd = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Module 1: User Profile Card */}
        <UserProfileCard
          user={mockUserProfile}
          isOwner={isOwner}
          onEditProfile={handleEditProfile}
          onFollow={handleFollow}
        />

        {/* Module 2: Swipeable Garage Graphic (Existing) */}
        {activeHolding ? (
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/5 rounded-3xl p-4 md:p-6">
            <div
              className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden"
              onTouchStart={(event) =>
                handleSwipeStart(event.touches[0].clientX)
              }
              onTouchMove={(event) =>
                handleSwipeMove(event.touches[0].clientX)
              }
              onTouchEnd={handleSwipeEnd}
            >
              <Image
                src={activeHolding.image}
                alt={activeHolding.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-wide text-white/70 font-mono">
                    {activeHolding.collection}
                  </p>
                  <h2 className="text-2xl md:text-4xl font-bold text-white font-mono">
                    {activeHolding.name}
                  </h2>
                  <p className="text-white/70 text-sm font-sans">
                    {activeHolding.location}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs uppercase text-white/60 font-mono">
                      Shares Owned
                    </p>
                    <p className="text-xl text-white font-semibold font-mono">
                      {activeHolding.sharesOwned.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/60 font-mono">
                      Ownership
                    </p>
                    <p className="text-xl text-white font-semibold font-mono">
                      {((activeHolding.sharesOwned / activeHolding.totalShares) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/60 font-mono">
                      USD Value
                    </p>
                    <p className="text-xl text-white font-semibold font-mono">
                      {formatUsd(activeHolding.usdValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/60 font-mono">
                      24h Move
                    </p>
                    <p
                      className={`text-xl font-semibold font-mono ${activeHolding.change24h >= 0 ? "text-[#00daa2]" : "text-red-400"}`}
                    >
                      {activeHolding.change24h >= 0 ? "+" : ""}
                      {activeHolding.change24h}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-white/20 text-white/80 hover:text-white"
                  onClick={showPreviousHolding}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border border-white/20 text-white/80 hover:text-white"
                  onClick={showNextHolding}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {rwaHoldings.map((holding, index) => (
                  <button
                    key={holding.id}
                    aria-label={`View ${holding.name}`}
                    className={`h-2 rounded-full transition-all ${
                      index === activeHoldingIndex
                        ? "bg-[#00daa2] w-8"
                        : "bg-white/30 w-4"
                    }`}
                    onClick={() => setActiveHoldingIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-6 text-center text-white/70">
              <p>No RWA holdings yet. Explore the marketplace to grab your first shares.</p>
            </CardContent>
          </Card>
        )}

        {/* Module 3: VHCL Collection (RWA Shares) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicle Collection */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white font-mono">
                    Vehicle Collection
                  </h2>
                  <Button
                    className="bg-[#00daa2] hover:bg-[#00b894] text-black font-mono"
                    size="sm"
                  >
                    Marketplace
                  </Button>
                </div>

                {/* Summary Value */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white font-mono mb-1">
                    {formatUsd(totalCollectionValue)}
                  </div>
                  <div className="text-lg text-[#00daa2] font-mono">
                    {weightedChange >= 0 ? "+" : ""}
                    {weightedChange.toFixed(2)}% 24hr
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="space-y-4">
                  {/* Cars Owned */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-none rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-red-500" />
                      </div>
                      <span className="text-white font-mono">Cars Owned</span>
                    </div>
                    <span className="text-white font-mono font-bold">
                      {rwaHoldings.length}
                    </span>
                  </div>

                  {/* 30 Day Performance */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-none rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#00daa2]" />
                      </div>
                      <span className="text-white font-mono">
                        30 Day Performance
                      </span>
                    </div>
                    <span
                      className={`${
                        weightedChange >= 0 ? "text-[#00daa2]" : "text-red-400"
                      } font-mono font-bold`}
                    >
                      {weightedChange.toFixed(2)}%
                    </span>
                  </div>

                  {/* Collection List */}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-none rounded-lg flex items-center justify-center">
                        <Coins className="w-7 h-7 text-white/80" />
                      </div>
                      <span className="text-[#00daa2] font-mono">
                        Collection List
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#00daa2]"
                      onClick={() => setIsCollectionExpanded((prev) => !prev)}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${isCollectionExpanded ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>

                  {isCollectionExpanded && (
                    <div className="mt-4 space-y-3">
                      {rwaHoldings.map((holding) => (
                        <div
                          key={holding.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5"
                        >
                          <div>
                            <p className="text-white font-mono font-semibold">
                              {holding.name}
                            </p>
                            <p className="text-white/60 text-xs font-sans">
                              {holding.sharesOwned.toLocaleString()} shares · {(holding.sharesOwned / holding.totalShares * 100).toFixed(2)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-mono font-semibold">
                              {formatUsd(holding.usdValue)}
                            </p>
                            <p
                              className={`text-xs font-mono ${holding.change24h >= 0 ? "text-[#00daa2]" : "text-red-400"}`}
                            >
                              {holding.change24h >= 0 ? "+" : ""}
                              {holding.change24h}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Assets Vault (Owner Only) */}
          {isOwner && (
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white font-mono mb-6">
                    Assets Vault
                  </h2>

                  {/* Total Value */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-white font-mono mb-1">
                      {isConnected ? (
                        `$${parseFloat(totalValue).toLocaleString()}`
                      ) : (
                        <span className="text-gray-400">Connect Wallet</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                      Total Portfolio Value
                    </div>
                  </div>

                  {/* Asset Breakdown */}
                  <div className="space-y-4">
                    {/* USDC Balance */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Image
                            src="/Cars/usdc.png"
                            alt="USDC"
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                        <span className="text-white font-mono text-sm">
                          Base USDC
                        </span>
                      </div>
                      <span className="text-white font-mono font-bold">
                        {isConnected ? (
                          `$${parseFloat(usdcBalance).toLocaleString()}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </span>
                    </div>

                    {/* ETH Balance */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Image
                            src="/Cars/base-logo.png"
                            alt="Base ETH"
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                          />
                        </div>
                        <span className="text-white font-mono text-sm">
                          Base ETH
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono font-bold">
                          {isConnected ? (
                            `${parseFloat(ethBalance).toFixed(4)}`
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                        {isConnected && parseFloat(ethBalance) > 0 && (
                          <ETHPriceDisplay
                            ethAmount={ethBalance}
                            className="text-xs text-[#00daa2] font-mono"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {!isConnected ? (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono"
                        size="sm"
                      >
                        Connect Wallet
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-[#00daa2] hover:bg-[#00b894] text-black font-mono"
                        size="sm"
                        onClick={() => setShowSwapModal(true)}
                      >
                        Swap
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Module 4: VHCL Registry (New) */}
        <VHCLRegistry
          vehicles={registeredVehicles}
          isOwner={isOwner}
          onRegisterClick={handleRegisterVehicle}
        />

        {/* Module 5: Digital Collectibles (Updated) */}
        <DigitalCollectibles />
      </div>

      {/* Swap Modal - Placed outside main container for full viewport coverage */}
      <BusterSwapModal
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        swapType="buy"
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />

      {/* Register Vehicle Modal */}
      <RegisterVehicleModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        userId={mockUserProfile._id}
        onSuccess={handleRegistrationSuccess}
      />

    </div>
  );
}
