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
import { VehicleDetailModal } from "./modals/VehicleDetailModal";
import type { VehicleRegistrationResult } from "@/hooks/useVehicleLifecycle";
import { vehicles, type Vehicle } from "@/app/data/vehicleData";

/**
 * Garage Component (Public Profile)
 *
 * This component displays the user's public profile and garage with:
 * 
 * PUBLIC SECTIONS (visible to everyone):
 * - User Profile Card (PFP, username, display name, bio, follower count, follow button, social links, edit profile button)
 * - Swipeable Garage Graphic (RWA vehicles they hold shares in)
 * - VHCL Collection (RWA stats, USD value, 24hr performance, car list)
 * - VHCL Registry (Registered vehicles, registration info, register button)
 * - Digital Collectibles (Ecosystem NFTs or available collections)
 * 
 * PRIVATE SECTIONS (visible only to profile owner):
 * - Assets Vault (Wallet balance)
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
  profileWalletAddress?: string; // Optional: for viewing other users' profiles
  onNavigate?: (page: string) => void; // For navigating within the dashboard
}

export function Garage({ currentUser, isAuthenticated, profileWalletAddress, onNavigate }: GarageProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVehicleDetail, setShowVehicleDetail] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeHoldingIndex, setActiveHoldingIndex] = useState(0);
  const [isCollectionExpanded, setIsCollectionExpanded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Determine if the viewer is the owner of the profile
  // The profile address should come from props (for viewing other users) or from the currentUser
  // IMPORTANT: Do NOT fall back to viewer's address, as that would incorrectly grant ownership
  const profileAddress = profileWalletAddress || currentUser?.walletAddress;
  
  // Only consider isOwner = true if:
  // 1. We have a valid profile address to compare against
  // 2. The viewer is connected with a wallet
  // 3. The connected wallet matches the profile wallet
  // If no profile address is available, default to true (viewing own profile in main garage view)
  const isOwner = !profileAddress 
    ? true // Default to owner view when no profile address is specified (main garage view)
    : (isConnected && address && profileAddress && 
       address.toLowerCase() === profileAddress.toLowerCase());

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


  // Mock user profile for demo
  // Use the profile address being viewed, or the connected address for own profile
  const displayWalletAddress = profileAddress || address || "0x0000000000000000000000000000000000000000";
  
  const mockUserProfile = {
    _id: "demo-user-id",
    username: currentUser?.username || "drvn_enthusiast",
    displayName: currentUser?.displayName || "DRVN Enthusiast",
    bio: currentUser?.bio || "Passionate about cars and Web3 🏎️",
    profileImage: currentUser?.profileImage || "https://github.com/shadcn.png",
    walletAddress: displayWalletAddress,
    socialLinks: currentUser?.socialLinks || {
      farcaster: "https://warpcast.com/drvn",
      base: "https://base.org/drvn",
      x: "https://x.com/drvn_platform",
      instagram: "https://instagram.com/drvn",
    },
    followerCount: currentUser?.followerCount || 1234,
    followingCount: currentUser?.followingCount || 567,
  };

  // Handlers
  const handleEditProfile = () => {
    if (onNavigate) {
      onNavigate("settings");
    } else {
      router.push("/settings");
    }
  };

  const handleRegisterVehicle = () => {
    setShowRegisterModal(true);
  };

  const handleRegistrationSuccess = (result: VehicleRegistrationResult) => {
    console.log("Vehicle registered:", result);
  };

  const handleFollow = () => {
    console.log("Follow clicked");
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetail(true);
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

        {/* =========================================== */}
        {/* PUBLIC PROFILE SECTION - Visible to Everyone */}
        {/* =========================================== */}

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
        <div className={`grid grid-cols-1 ${isOwner ? 'lg:grid-cols-3' : ''} gap-6`}>
          {/* Left Column - Vehicle Collection (Full width when not owner) */}
          <div className={isOwner ? "lg:col-span-2" : ""}>
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

          {/* Right Column - Assets Vault (Owner Only - PRIVATE) */}
          {isOwner && (
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm h-full relative overflow-hidden">
                {/* Private Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full font-mono border border-purple-500/30">
                    Private
                  </span>
                </div>
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
          isOwner={isOwner}
          onRegisterClick={handleRegisterVehicle}
          onVehicleClick={handleVehicleClick}
        />

        {/* Module 5: Digital Collectibles (Updated) */}
        <DigitalCollectibles 
          profileAddress={profileAddress}
          isOwner={isOwner}
        />
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

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          isOpen={showVehicleDetail}
          onClose={() => {
            setShowVehicleDetail(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
          isOwner={isOwner}
        />
      )}

    </div>
  );
}
