"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Trophy,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Plus,
  ExternalLink,
  Share2
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BuySponsorshipModal } from "./BuySponsorshipModal";

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
    mintedCount: number;
  };
  sponsors: Sponsor[];
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

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: RegisteredVehicle | null;
  isOwner?: boolean;
}

export function VehicleDetailModal({ isOpen, onClose, vehicle, isOwner = false }: VehicleDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSponsorModal, setShowSponsorModal] = useState(false);

  if (!vehicle) return null;

  // Mock tagged posts - would come from API
  const taggedPosts: TaggedPost[] = [
    {
      id: "p1",
      author: { username: "gearhead", avatar: "/avatars/default.png" },
      content: "Just spotted this beauty at the local meet! 🔥",
      image: vehicle.images[0]?.url,
      timestamp: "2h ago",
      likes: 45,
    },
    {
      id: "p2",
      author: { username: "jdm_lover", avatar: "/avatars/default.png" },
      content: "The sound of that engine is pure music",
      timestamp: "5h ago",
      likes: 32,
    },
  ];

  const nftImage = vehicle.images.find(img => img.isNftImage)?.url || vehicle.images[0]?.url;
  const mintedCount = vehicle.sponsorshipCollection?.mintedCount || vehicle.sponsors.length;
  const availableSlots = vehicle.sponsorshipCollection 
    ? vehicle.sponsorshipCollection.maxSupply - mintedCount
    : 0;

  // Gallery navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  // Build sponsor slots array for 7x2 grid
  const sponsorSlots = vehicle.sponsorshipCollection 
    ? Array.from({ length: vehicle.sponsorshipCollection.maxSupply }, (_, i) => {
        const sponsor = vehicle.sponsors.find(s => parseInt(s.tokenId) === i + 1);
        return { id: i + 1, sponsor, isAvailable: !sponsor };
      })
    : [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="max-w-6xl w-[95vw] h-[90vh] p-0 bg-black/60 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50"
          aria-describedby="vehicle-detail-description"
        >
          {/* Accessibility: Hidden title and description for screen readers */}
          <VisuallyHidden>
            <DialogTitle>
              {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`} Details
            </DialogTitle>
            <DialogDescription id="vehicle-detail-description">
              View details, images, sponsorship information, and token data for {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            </DialogDescription>
          </VisuallyHidden>
          
          {/* Header - Glassmorphic */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white font-mono">
                {vehicle.nickname || `${vehicle.year} ${vehicle.model}`}
              </h2>
              {vehicle.carToken && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  ${vehicle.carToken.ticker}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto h-[calc(90vh-65px)] p-4 md:p-6 sleek-scrollbar">
            {/* Module 1: Swipeable Gallery */}
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-black/40 mb-6 group border border-white/10 shadow-xl">
              {vehicle.images.length > 0 ? (
                <>
                  <Image
                    src={vehicle.images[currentImageIndex].url}
                    alt={`${vehicle.nickname || vehicle.model} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* NFT Badge */}
                  {vehicle.images[currentImageIndex].isNftImage && (
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      NFT Image
                    </div>
                  )}

                  {/* Navigation Arrows - Sleek glassmorphic */}
                  {vehicle.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter - Glassmorphic */}
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white/90 font-mono border border-white/10">
                    {currentImageIndex + 1} / {vehicle.images.length}
                  </div>

                  {/* Dot Navigation - Sleek */}
                  {vehicle.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                      {vehicle.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx === currentImageIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/70 w-1.5"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  No Images Available
                </div>
              )}
            </div>

            {/* Two Column Layout - Desktop: side by side, Mobile: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Module 2: Car Profile Card with Sponsor Preview */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* NFT Image */}
                      <div className="flex-shrink-0 relative">
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-white/20 rounded-2xl shadow-lg">
                          <AvatarImage src={nftImage} className="object-cover" />
                          <AvatarFallback className="bg-white/10 backdrop-blur rounded-2xl text-xs">
                            {vehicle.year}
                          </AvatarFallback>
                        </Avatar>
                        {vehicle.isUpgraded && vehicle.carToken && (
                          <div className="absolute -bottom-2 -right-2 bg-primary/90 backdrop-blur-sm text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/50 shadow-lg">
                            ${vehicle.carToken.ticker}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-grow space-y-2 w-full">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {vehicle.nickname || `${vehicle.year} ${vehicle.model}`}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                        </div>

                        {/* Owner & Location */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                          {vehicle.owner && (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={vehicle.owner.avatar} />
                                <AvatarFallback>{vehicle.owner.name[0]}</AvatarFallback>
                              </Avatar>
                              <span>@{vehicle.owner.username || vehicle.owner.name}</span>
                            </div>
                          )}
                          {vehicle.location && (
                            <span>📍 {vehicle.location}</span>
                          )}
                          {vehicle.registryId && (
                            <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white/80 text-[10px] border border-white/10">
                              #{vehicle.registryId}
                            </Badge>
                          )}
                        </div>

                        {/* Sponsor Preview - Only if upgraded */}
                        {vehicle.isUpgraded && vehicle.sponsorshipCollection && (
                          <div className="pt-3 border-t border-white/10 mt-3">
                            <p className="text-xs text-zinc-500 mb-2">Sponsored by</p>
                            <div className="flex items-center gap-2">
                              {/* Overlapping sponsor logos (max 5) */}
                              <div className="flex -space-x-2">
                                {vehicle.sponsors.slice(0, 5).map((sponsor, i) => (
                                  <div
                                    key={sponsor.tokenId}
                                    className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center overflow-hidden"
                                    style={{ zIndex: 5 - i }}
                                  >
                                    {sponsor.logo ? (
                                      <Image src={sponsor.logo} alt={sponsor.name || ""} width={32} height={32} className="object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-white font-bold">
                                        {sponsor.name?.substring(0, 2) || `S${i + 1}`}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {/* Overflow count */}
                                {vehicle.sponsors.length > 5 && (
                                  <div className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-zinc-950 flex items-center justify-center">
                                    <span className="text-[10px] text-white font-bold">
                                      +{vehicle.sponsors.length - 5}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {/* Remaining slots */}
                              {availableSlots > 0 && (
                                <span className="text-xs text-primary font-semibold">
                                  | {availableSlots} remaining
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Module 3: Sponsorship Module (7x2 Grid) */}
                {vehicle.isUpgraded && vehicle.sponsorshipCollection && (
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          {isOwner ? "Sponsorship Slots" : "Sponsors"}
                        </CardTitle>
                        {isOwner ? (
                          <Badge className="bg-yellow-500/20 backdrop-blur-sm text-yellow-400 border border-yellow-500/30 shadow-lg">
                            {availableSlots} Available
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-yellow-500/90 hover:bg-yellow-500 text-black font-bold rounded-full px-4 shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                            onClick={() => setShowSponsorModal(true)}
                            disabled={availableSlots === 0}
                          >
                            {availableSlots === 0 ? "Sold Out" : `Become a Sponsor`}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
                        <span>{mintedCount}/{vehicle.sponsorshipCollection.maxSupply} claimed</span>
                        <span className="text-white font-semibold">{vehicle.sponsorshipCollection.mintPrice} USDC per slot</span>
                      </div>
                      {/* Progress Bar - Sleek */}
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden mt-2">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all shadow-sm shadow-yellow-500/50"
                          style={{ width: `${(mintedCount / vehicle.sponsorshipCollection.maxSupply) * 100}%` }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* 7x2 Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {sponsorSlots.map((slot) => (
                          <div key={slot.id} className="aspect-square">
                            {slot.isAvailable ? (
                              <button
                                onClick={() => setShowSponsorModal(true)}
                                className="w-full h-full rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 transition-all flex flex-col items-center justify-center group backdrop-blur-sm"
                              >
                                <Plus className="w-3 h-3 md:w-4 md:h-4 text-white/30 group-hover:text-yellow-400" />
                                <span className="text-[8px] text-white/20 group-hover:text-yellow-400/80 hidden md:block">
                                  #{slot.id}
                                </span>
                              </button>
                            ) : (
                              <div className="w-full h-full rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm shadow-lg">
                                {slot.sponsor?.logo ? (
                                  <Image
                                    src={slot.sponsor.logo}
                                    alt={slot.sponsor.name || "Sponsor"}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-white/10 text-[10px] font-bold text-white/60">
                                    {slot.sponsor?.name?.substring(0, 2) || "SP"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Module 4a: Upgrade Prompt (for non-upgraded vehicles) */}
                {!vehicle.isUpgraded && isOwner && (
                  <Card className="bg-gradient-to-br from-primary/10 to-yellow-500/5 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-xl overflow-hidden">
                    <CardContent className="p-6 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-lg shadow-primary/20">
                          <TrendingUp className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Upgrade Your Vehicle</h3>
                        <p className="text-sm text-zinc-400 mb-5">
                          Launch a token for your car and unlock sponsorship opportunities, 
                          fractional ownership trading, and community engagement.
                        </p>
                        <Button className="bg-primary/90 hover:bg-primary text-black font-bold w-full rounded-xl shadow-lg shadow-primary/30 transition-all hover:shadow-primary/50">
                          Start Upgrade ($150)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Module 4b: Token Details (for upgraded vehicles) */}
                {vehicle.carToken && (
                  <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        ${vehicle.carToken.ticker} Token
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-1">Price</p>
                          <p className="text-lg font-bold text-white font-mono">
                            ${vehicle.carToken.price.toFixed(6)}
                          </p>
                        </div>
                        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5">
                          <p className="text-xs text-zinc-500 mb-1">24h Change</p>
                          <div className={cn(
                            "text-lg font-bold flex items-center gap-1",
                            vehicle.carToken.change24h >= 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {vehicle.carToken.change24h >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(vehicle.carToken.change24h).toFixed(2)}%
                          </div>
                        </div>
                        <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 col-span-2">
                          <p className="text-xs text-zinc-500 mb-1">Market Cap</p>
                          <p className="text-lg font-bold text-white">
                            ${vehicle.carToken.mcap.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Chart Placeholder - Sleek */}
                      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-dashed border-white/5 text-center mb-4">
                        <BarChart3 className="w-6 h-6 text-white/20 mx-auto mb-1" />
                        <p className="text-xs text-white/30">Chart coming soon</p>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-primary/90 hover:bg-primary text-black font-bold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all">
                          Swap ${vehicle.carToken.ticker}
                        </Button>
                        <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/10 rounded-xl transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Module 5: Content Feed */}
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 rounded-2xl shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Tagged Posts
                    </CardTitle>
                    <p className="text-xs text-zinc-500">Posts featuring this vehicle</p>
                  </CardHeader>
                  <CardContent>
                    {taggedPosts.length > 0 ? (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 sleek-scrollbar">
                        {taggedPosts.map((post) => (
                          <div key={post.id} className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden relative">
                                <Image
                                  src={post.author.avatar}
                                  alt={post.author.username}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">@{post.author.username}</p>
                                <p className="text-[10px] text-zinc-500">{post.timestamp}</p>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-300 mb-2">{post.content}</p>
                            {post.image && (
                              <div className="relative aspect-video rounded overflow-hidden mb-2">
                                <Image src={post.image} alt="Post" fill className="object-cover" />
                              </div>
                            )}
                            <p className="text-xs text-zinc-500">❤️ {post.likes}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">No posts tagged yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Sponsor Modal */}
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
    </>
  );
}
