"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Image from "next/image";
import { SwipeableGallery } from "./SwipeableGallery";
import { CarProfileCard } from "./CarProfileCard";
import { SponsorshipModule } from "./SponsorshipModule";
import { TokenDetails } from "./TokenDetails";
import { BuySponsorshipModal } from "../modals/BuySponsorshipModal";

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
}

export function RegisteredVHCLPage({ vehicleId, onBack }: RegisteredVHCLPageProps) {
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  // Mock data - will be replaced with API call
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
      address: "0x1234...5678",
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
      { tokenId: "1", name: "BSTR", logo: "/icons/bstr-icon.svg", holderAddress: "0xsp1..." },
      { tokenId: "2", name: "Base", logo: "/icons/base-icon.svg", holderAddress: "0xsp2..." },
      { tokenId: "3", name: "Coinbase", logo: "/icons/coinbase-icon.svg", holderAddress: "0xsp3..." },
    ],
    ownerAddress: "0x1234...5678",
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

  const handleSponsorClick = () => {
    setShowSponsorModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-zinc-400 hover:text-white hover:bg-white/10 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Garage
      </Button>

      {/* Module 1: Swipeable Gallery */}
      <SwipeableGallery images={vehicle.images} />

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Module 2: Car Profile Card */}
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

          {/* Module 3: Sponsorship Module */}
          {vehicle.isUpgraded && vehicle.sponsorshipCollection && (
            <SponsorshipModule
              vehicleName={vehicle.nickname || vehicle.model}
              sponsorshipCollection={vehicle.sponsorshipCollection}
              sponsors={vehicle.sponsors}
              onSponsorClick={handleSponsorClick}
            />
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Module 4: Token Details */}
          {vehicle.carToken && (
            <TokenDetails
              token={{
                address: vehicle.carToken.address,
                ticker: vehicle.carToken.ticker,
                price: vehicle.carToken.price,
                mcap: vehicle.carToken.mcap,
                change24h: vehicle.carToken.change24h,
              }}
            />
          )}

          {/* Module 5: Content Feed */}
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

      {/* Sponsor Modal */}
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
    </div>
  );
}
