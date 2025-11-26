"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Users, Zap, Coins, TrendingUp, Shield, Share2 } from "lucide-react";
import Image from "next/image";
import { SwipeableGallery } from "./SwipeableGallery";
import { CarProfileCard } from "./CarProfileCard";
import { SponsorshipModule } from "./SponsorshipModule";
import { TokenDetails } from "./TokenDetails";
import { BuySponsorshipModal } from "../modals/BuySponsorshipModal";
import { UpgradeVehicleModal } from "../modals/UpgradeVehicleModal";
import { TokenSwapModal } from "../modals/TokenSwapModal";

interface VehicleImage {
  url: string;
  isNftImage: boolean;
}

interface Sponsor {
  tokenId: string;
  logo?: string;
  name?: string;
  holderAddress: string;
}

interface RegisteredVehicle {
  _id: string;
  nickname?: string;
  make: string;
  model: string;
  year: number;
  images: VehicleImage[];
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
    address: string;
    ticker: string;
    price: number;
    change24h: number;
    mcap: number;
  };
  sponsorshipCollection?: {
    contractAddress: string;
    maxSupply: number;
    mintPrice: number;
    mintedCount?: number;
  };
  sponsors: Sponsor[];
  ownerAddress: string;
}

interface TaggedPost {
  id: string;
  author: {
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
}

interface RegisteredVHCLPageProps {
  vehicleId: string;
  onBack: () => void;
  currentUserAddress?: string;
  isOwner?: boolean;
  connectedPlatforms?: string[];
}

export function RegisteredVHCLPage({ 
  vehicleId, 
  onBack, 
  currentUserAddress,
  isOwner = false,
  connectedPlatforms = []
}: RegisteredVHCLPageProps) {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  const vehicle: RegisteredVehicle = {
    _id: vehicleId,
    nickname: "Project Midnight",
    make: "Nissan",
    model: "GT-R R34",
    year: 1999,
    images: [
      { url: "/Cars/R34GTR.jpg", isNftImage: true },
      { url: "/Cars/GarageV12.jpg", isNftImage: false },
      { url: "/Cars/Porsche911.jpg", isNftImage: false },
    ],
    isUpgraded: true,
    location: "Los Angeles, CA",
    registryId: "DRVN-0042",
    owner: {
      name: "gearhead_mike",
      username: "gearhead_mike",
      avatar: "/avatars/default.png",
    },
    followerCount: 1234,
    carToken: {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      ticker: "MDNGHT",
      price: 0.000045,
      change24h: 5.2,
      mcap: 45000,
    },
    sponsorshipCollection: {
      contractAddress: "0xsponsorship...",
      maxSupply: 14,
      mintPrice: 50,
      mintedCount: 3,
    },
    sponsors: [
      { tokenId: "1", name: "BSTR", logo: "/Cars/BSTR-Logo-Official.png", holderAddress: "0xsp1..." },
      { tokenId: "2", name: "Base", logo: "/Cars/DCWhtV4.png", holderAddress: "0xsp2..." },
      { tokenId: "3", name: "Coinbase", logo: "/Cars/DRVNLaboLogoDrk.png", holderAddress: "0xsp3..." },
    ],
    ownerAddress: currentUserAddress || "0x1234...5678",
  };

  const taggedPosts: TaggedPost[] = [
    {
      id: "p1",
      author: { username: "gearhead", avatar: "/avatars/default.png" },
      content: "Just spotted this beauty at the local meet! 🔥",
      image: "/Cars/R34GTR.jpg",
      timestamp: "2h ago",
      likes: 45,
    },
    {
      id: "p2",
      author: { username: "jdm_lover", avatar: "/avatars/default.png" },
      content: "The sound of that RB26 is pure music",
      timestamp: "5h ago",
      likes: 32,
    },
  ];

  const nftImage = vehicle.images.find(img => img.isNftImage)?.url || vehicle.images[0]?.url;
  const availableSlots = vehicle.sponsorshipCollection 
    ? vehicle.sponsorshipCollection.maxSupply - (vehicle.sponsorshipCollection.mintedCount || 0)
    : 0;
  const vehicleDisplayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const handleSponsorClick = () => {
    setShowSponsorModal(true);
  };

  const handleUpgradeComplete = () => {
    setShowUpgradeModal(false);
  };

  const handleShare = () => {
    const text = vehicle.carToken
      ? `Check out ${vehicleDisplayName} on @DRVN_VHCLS! Trading as $${vehicle.carToken.ticker} 🚗`
      : `Check out ${vehicleDisplayName} on @DRVN_VHCLS! 🚗`;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-zinc-400 hover:text-white hover:bg-white/10 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Garage
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-zinc-400 hover:text-white hover:bg-white/10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      <SwipeableGallery images={vehicle.images} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CarProfileCard
            vehicle={{
              nickname: vehicle.nickname,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              nftImage: nftImage,
              isUpgraded: vehicle.isUpgraded,
              location: vehicle.location,
              registryId: vehicle.registryId,
              owner: vehicle.owner,
              followerCount: vehicle.followerCount,
              carToken: vehicle.carToken ? { ticker: vehicle.carToken.ticker } : undefined,
              sponsorshipCollection: vehicle.sponsorshipCollection ? {
                maxSupply: vehicle.sponsorshipCollection.maxSupply,
                mintedCount: vehicle.sponsorshipCollection.mintedCount || 0,
              } : undefined,
            }}
          />

          {vehicle.isUpgraded && vehicle.sponsorshipCollection && (
            <SponsorshipModule
              vehicleName={vehicle.nickname || vehicle.model}
              sponsorshipCollection={vehicle.sponsorshipCollection}
              sponsors={vehicle.sponsors}
              onSponsorClick={handleSponsorClick}
            />
          )}

          {!vehicle.isUpgraded && isOwner && (
            <Card className="bg-gradient-to-br from-primary/20 to-yellow-500/10 border-primary/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Upgrade to Monetize
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300 mb-4">
                  Create a tradeable token for your vehicle and unlock sponsorship opportunities.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Coins className="w-4 h-4 text-primary" />
                    <span>ERC20 Car Token</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Users className="w-4 h-4 text-primary" />
                    <span>14 Sponsor Slots</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>Trading Revenue</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>10% Creator Reserve</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">$5</span>
                  <span className="text-zinc-400">+ 5% token supply</span>
                </div>
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade Vehicle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {vehicle.carToken && (
            <TokenDetails
              token={{
                address: vehicle.carToken.address,
                ticker: vehicle.carToken.ticker,
                price: vehicle.carToken.price,
                mcap: vehicle.carToken.mcap,
                change24h: vehicle.carToken.change24h,
              }}
              vehicleName={vehicleDisplayName}
              onSwapClick={() => setShowSwapModal(true)}
            />
          )}

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Tagged Posts
              </CardTitle>
              <p className="text-xs text-zinc-400">
                Posts featuring this vehicle
              </p>
            </CardHeader>
            <CardContent>
              {taggedPosts.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {taggedPosts.map((post) => (
                    <div key={post.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden relative">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">@{post.author.username}</p>
                          <p className="text-xs text-zinc-500">{post.timestamp}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-300 mb-3">{post.content}</p>
                      {post.image && (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                          <Image
                            src={post.image}
                            alt="Post image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>❤️ {post.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No posts tagged with this vehicle yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <BuySponsorshipModal
        isOpen={showSponsorModal}
        onClose={() => setShowSponsorModal(false)}
        vehicleId={vehicle._id}
        vehicleName={vehicle.nickname || vehicle.model}
        vehicleImage={nftImage || ""}
        mintPrice={vehicle.sponsorshipCollection?.mintPrice || 50}
        availableSlots={availableSlots}
        onPurchaseSuccess={(result) => {
          console.log("Sponsorship purchased:", result);
          setShowSponsorModal(false);
        }}
      />

      <UpgradeVehicleModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        vehicleId={vehicle._id}
        vehicleName={vehicleDisplayName}
        vehicleImage={nftImage}
        onUpgradeComplete={() => handleUpgradeComplete()}
        connectedPlatforms={connectedPlatforms}
      />

      {vehicle.carToken && (
        <TokenSwapModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          token={{
            address: vehicle.carToken.address,
            ticker: vehicle.carToken.ticker,
          }}
        />
      )}
    </div>
  );
}
