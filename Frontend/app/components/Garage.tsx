/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusterSwapModal } from "./modals/token-swap-modal";
import { UserProfileCard } from "./profile/UserProfileCard";
import { VHCLCollectionTabs } from "./profile/VHCLCollectionTabs";
import { AssetVaultTabs } from "./profile/AssetVaultTabs";
import { RegisterVehicleModal } from "./modals/RegisterVehicleModal";
import { VehicleDetailModal } from "./modals/VehicleDetailModal";
import { SponsorProfileEditorModal } from "./modals/SponsorProfileEditorModal";
import { RegisteredVHCLPage } from "./vehicle/RegisteredVHCLPage";
import { GarageHero } from "./garage/GarageHero";
import { GarageCustomizeModal } from "./modals/GarageCustomizeModal";
import type { VehicleRegistrationResult } from "@/hooks/useVehicleLifecycle";
import { type Vehicle, type Sponsor } from "@/app/data/vehicleData";

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
  ticker?: string;
}

interface RegisteredVehicle {
  _id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  registryId: string;
  images: { url: string; isNftImage: boolean }[];
  isUpgraded: boolean;
  carToken?: { ticker: string; address: string };
  createdAt: string;
}

interface GarageProps {
  currentUser: any;
  isAuthenticated: boolean;
  profileWalletAddress?: string;
  onNavigate?: (page: string) => void;
}

export function Garage({ currentUser, isAuthenticated, profileWalletAddress, onNavigate }: GarageProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVehicleDetail, setShowVehicleDetail] = useState(false);
  const [showRegisteredVehiclePage, setShowRegisteredVehiclePage] = useState(false);
  const [showSponsorEditor, setShowSponsorEditor] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedRegisteredVehicle, setSelectedRegisteredVehicle] = useState<RegisteredVehicle | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<{ sponsor: Sponsor; vehicleName: string } | null>(null);
  const [activeHoldingIndex, setActiveHoldingIndex] = useState(0);
  const [showGarageCustomize, setShowGarageCustomize] = useState(false);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState("bg-default-1");
  const [registeredVehicles, setRegisteredVehicles] = useState<RegisteredVehicle[]>([
    {
      _id: "reg-1",
      nickname: "Project Midnight",
      make: "Nissan",
      model: "GT-R R34",
      year: 1999,
      vin: "JN1GANR34Z0000042",
      registryId: "DRVN-0042",
      images: [
        { url: "/Cars/GtrDemo1.png", isNftImage: true },
        { url: "/Cars/GtrDemo2.png", isNftImage: false },
      ],
      isUpgraded: true,
      carToken: {
        ticker: "MDNGHT",
        address: "0x1234567890abcdef1234567890abcdef12345678",
      },
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "reg-2",
      nickname: "",
      make: "Honda",
      model: "NSX Type S",
      year: 2022,
      vin: "19UNC1B03NY000123",
      registryId: "DRVN-0123",
      images: [
        { url: "/Cars/nsx-ts-2.jpg", isNftImage: true },
      ],
      isUpgraded: false,
      createdAt: "2024-02-20T14:45:00Z",
    },
  ]);

  const profileAddress = profileWalletAddress || currentUser?.walletAddress;
  
  const isOwner = !profileAddress 
    ? true
    : (isConnected && address && profileAddress && 
       address.toLowerCase() === profileAddress.toLowerCase());

  const rwaHoldings: RwaHolding[] = currentUser?.rwaHoldings || [
    {
      id: "rwa-ferrari",
      name: "Ferrari 360 Modena",
      collection: "Italian Exotics",
      ticker: "F360",
      sharesOwned: 1250,
      totalShares: 10000,
      usdValue: 27500,
      change24h: 2.4,
      image: "/Cars/modena1.jpg",
      location: "Los Angeles, CA",
    },
    {
      id: "rwa-r34",
      name: "Nissan R34 GT-R",
      collection: "Skyline Legends",
      ticker: "R34GTR",
      sharesOwned: 890,
      totalShares: 8000,
      usdValue: 18200,
      change24h: -1.1,
      image: "/Cars/GtrHero1.jpg",
      location: "Tokyo, JP",
    },
    {
      id: "rwa-nsx",
      name: "Honda NSX Type S",
      collection: "Track Icons",
      ticker: "NSXTS",
      sharesOwned: 640,
      totalShares: 7500,
      usdValue: 15980,
      change24h: 0.9,
      image: "/Cars/nsx-ts-2.jpg",
      location: "Miami, FL",
    },
  ];

  const activeHolding =
    rwaHoldings.length > 0
      ? rwaHoldings[activeHoldingIndex % rwaHoldings.length]
      : null;

  const garageBackgrounds = [
    {
      id: "bg-default-1",
      src: "/garage-backgrounds/default-garage-1.jpg",
      name: "JDM Warehouse",
      focusY: 65,
      isNft: false,
    },
    {
      id: "bg-garage-2",
      src: "/garage-backgrounds/garage-2.png",
      name: "Industrial Shop",
      focusY: 60,
      isNft: false,
    },
  ];

  const carOverlays = rwaHoldings.map((holding) => ({
    id: holding.id,
    src: holding.id === "rwa-ferrari" 
      ? "/car-overlays/ferrari-360.png" 
      : holding.id === "rwa-r34"
        ? "/car-overlays/gtr-r34.png"
        : holding.image,
    name: holding.name,
    collection: holding.collection,
    ticker: holding.ticker,
    location: holding.location,
    sharesOwned: holding.sharesOwned,
    totalShares: holding.totalShares,
    usdValue: holding.usdValue,
    change24h: holding.change24h,
    offsetX: 0,
  }));

  const selectedBackground = garageBackgrounds.find(bg => bg.id === selectedBackgroundId) || garageBackgrounds[0];

  const displayWalletAddress = profileAddress || address || "0x0000000000000000000000000000000000000000";
  
  const mockUserProfile = {
    _id: "demo-user-id",
    username: currentUser?.username || "drvn_enthusiast",
    displayName: currentUser?.displayName || "DRVN Enthusiast",
    bio: currentUser?.bio || "Passionate about cars and Web3. Check out my builds at https://drvn.io/garage 🏎️",
    profileImage: currentUser?.profileImage || "https://github.com/shadcn.png",
    walletAddress: displayWalletAddress,
    farcasterHandle: currentUser?.farcasterHandle || "drvn",
    baseHandle: currentUser?.baseHandle || "drvn_vhcls",
    socialLinks: currentUser?.socialLinks || {
      farcaster: "https://warpcast.com/drvn",
      base: "https://base.org/drvn",
      x: "https://x.com/drvn_platform",
      instagram: "https://instagram.com/drvn",
    },
    followerCount: currentUser?.followerCount || 1234,
    followingCount: currentUser?.followingCount || 567,
  };

  const vehicleTokens = registeredVehicles
    .filter(v => v.isUpgraded && v.carToken)
    .map(v => ({
      ticker: v.carToken!.ticker,
      address: v.carToken!.address,
      vehicleName: `${v.year} ${v.make} ${v.model}`,
    }));

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
    const newVehicle: RegisteredVehicle = {
      _id: result.vehicleId,
      nickname: result.nickname || "",
      make: result.factorySpecs.make,
      model: result.factorySpecs.model,
      year: result.factorySpecs.year,
      vin: result.vin,
      registryId: result.registryId || `DRVN-${result.tokenId.toString().padStart(4, "0")}`,
      images: result.images.map((url, index) => ({ url, isNftImage: index === 0 })),
      isUpgraded: false,
      createdAt: new Date().toISOString(),
    };
    setRegisteredVehicles(prev => [newVehicle, ...prev]);
    setShowRegisterModal(false);
  };

  const handleRegisteredVehicleClick = (vehicle: RegisteredVehicle) => {
    setSelectedRegisteredVehicle(vehicle);
    setShowRegisteredVehiclePage(true);
  };

  const handleBackFromRegisteredVehicle = () => {
    setShowRegisteredVehiclePage(false);
    setSelectedRegisteredVehicle(null);
  };

  const handleFollow = () => {
    console.log("Follow clicked");
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleDetail(true);
  };

  const handleSponsorDashboardClick = (sponsor: Sponsor, vehicleName: string) => {
    setSelectedSponsor({ sponsor, vehicleName });
    setShowSponsorEditor(true);
  };

  const handleTokenClick = (token: { ticker: string; vehicleName?: string }) => {
    const vehicle = registeredVehicles.find(v => v.carToken?.ticker === token.ticker);
    if (vehicle) {
      handleRegisteredVehicleClick(vehicle);
    }
  };

  const { data: ethBalanceData } = useBalance({
    address: address,
    query: {
      refetchInterval: 30000,
    },
  });

  const ethBalance = ethBalanceData
    ? formatUnits(ethBalanceData.value, 18)
    : "0";

  // const ethPrice = 3000; // Reserved for ETH value calculations
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
    <div className="w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 px-0">

        {/* Module 1: User Profile Card - ABOVE Hero on desktop */}
        <UserProfileCard
          user={mockUserProfile}
          isOwner={isOwner}
          vehicleTokens={vehicleTokens}
          onEditProfile={handleEditProfile}
          onFollow={handleFollow}
          onTokenClick={handleTokenClick}
        />

        {/* Module 2: Swipeable Garage Graphic (Hero Section) - Dual Layer */}
        <GarageHero
          backgrounds={garageBackgrounds}
          cars={carOverlays}
          activeBackgroundIndex={garageBackgrounds.findIndex(bg => bg.id === selectedBackgroundId)}
          activeCarIndex={activeHoldingIndex}
          onBackgroundChange={(index) => setSelectedBackgroundId(garageBackgrounds[index].id)}
          onCarChange={setActiveHoldingIndex}
          onCustomize={() => setShowGarageCustomize(true)}
          isOwner={isOwner}
        />

        {/* Module 3: Portfolio Snapshot */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white font-mono">Portfolio Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-zinc-400 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white font-mono">{formatUsd(totalCollectionValue)}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-zinc-400 mb-1">24h Change</p>
                <p className={`text-2xl font-bold font-mono ${weightedChange >= 0 ? 'text-[#00daa2]' : 'text-red-400'}`}>
                  {weightedChange >= 0 ? '+' : ''}{weightedChange.toFixed(2)}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-zinc-400 mb-1">Vehicles Owned</p>
                <p className="text-2xl font-bold text-white font-mono">{rwaHoldings.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                <p className="text-xs text-zinc-400 mb-1">ETH Balance</p>
                <p className="text-2xl font-bold text-white font-mono">
                  {isConnected ? parseFloat(ethBalance).toFixed(4) : '---'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module 4: VHCL Collection (4 Tabs) - PUBLIC */}
        <VHCLCollectionTabs
          isOwner={isOwner}
          profileAddress={profileAddress}
          onRegisterClick={handleRegisterVehicle}
          onVehicleClick={handleVehicleClick}
          onSponsorDashboardClick={handleSponsorDashboardClick}
        />

        {/* Module 5: Asset Vault (2 Tabs) - OWNER ONLY */}
        <AssetVaultTabs
          isOwner={isOwner}
          profileAddress={profileAddress}
          onSwapClick={() => setShowSwapModal(true)}
          onSponsorManageClick={handleSponsorDashboardClick}
        />
      </div>

      {/* Swap Modal */}
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

      {/* Sponsor Profile Editor Modal */}
      {selectedSponsor && (
        <SponsorProfileEditorModal
          isOpen={showSponsorEditor}
          onClose={() => {
            setShowSponsorEditor(false);
            setSelectedSponsor(null);
          }}
          sponsor={{
            tokenId: selectedSponsor.sponsor.tokenId,
            name: selectedSponsor.sponsor.name || "",
            holderAddress: selectedSponsor.sponsor.holderAddress,
            bio: selectedSponsor.sponsor.bio,
            website: selectedSponsor.sponsor.websiteUrl,
            promoLink: selectedSponsor.sponsor.promoUrl,
            logo: selectedSponsor.sponsor.logo,
            socialLinks: selectedSponsor.sponsor.socialLinks,
            galleryImages: selectedSponsor.sponsor.gallery,
          }}
          vehicleName={selectedSponsor.vehicleName}
        />
      )}

      {/* Registered Vehicle Modal View */}
      {showRegisteredVehiclePage && selectedRegisteredVehicle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleBackFromRegisteredVehicle}
          />
          <div className="relative w-full max-w-6xl mx-4 my-8 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <RegisteredVHCLPage
              vehicleId={selectedRegisteredVehicle._id}
              vehicleData={selectedRegisteredVehicle}
              onBack={handleBackFromRegisteredVehicle}
              onUpdate={(updates) => {
                setRegisteredVehicles(prev => prev.map(v => 
                  v._id === selectedRegisteredVehicle._id 
                    ? { ...v, ...updates }
                    : v
                ));
                setSelectedRegisteredVehicle(prev => prev ? { ...prev, ...updates } : null);
              }}
              currentUserAddress={address}
              isOwner={isOwner}
            />
          </div>
        </div>
      )}

      {/* Garage Customize Modal */}
      <GarageCustomizeModal
        isOpen={showGarageCustomize}
        onClose={() => setShowGarageCustomize(false)}
        backgrounds={garageBackgrounds}
        cars={carOverlays}
        selectedBackgroundId={selectedBackgroundId}
        selectedCarId={carOverlays[activeHoldingIndex]?.id || ""}
        onBackgroundSelect={(id) => setSelectedBackgroundId(id)}
        onCarSelect={(id) => {
          const index = carOverlays.findIndex(c => c.id === id);
          if (index >= 0) setActiveHoldingIndex(index);
        }}
      />

    </div>
  );
}
