"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { 
  ArrowLeft, Users, Zap, Coins, TrendingUp, Shield, Share2, 
  Plus, X, Edit2, Save, ImagePlus, Trash2, Wrench 
} from "lucide-react";
import Image from "next/image";
import { SwipeableGallery } from "./SwipeableGallery";
import { CarProfileCard } from "./CarProfileCard";
import { SponsorshipModule } from "./SponsorshipModule";
import { TokenDetails } from "./TokenDetails";
import { BuySponsorshipModal } from "../modals/BuySponsorshipModal";
import { UpgradeVehicleModal } from "../modals/UpgradeVehicleModal";
import { TokenSwapModal } from "../modals/TokenSwapModal";
import { CreateSponsorshipCollectionModal } from "../modals/CreateSponsorshipCollectionModal";
import { MintSponsorshipModal } from "../modals/MintSponsorshipModal";
import { SponsorProfileEditorModal } from "../modals/SponsorProfileEditorModal";
import { useToast } from "@/app/components/ui/toast-context";

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
  description?: string;
  modifications?: string[];
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
  vehicleData?: {
    _id: string;
    nickname?: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    registryId: string;
    images: { url: string; isNftImage: boolean }[];
    isUpgraded: boolean;
    description?: string;
    modifications?: string[];
    carToken?: {
      ticker: string;
      address: string;
    };
  };
  onBack: () => void;
  onUpdate?: (updates: { images?: VehicleImage[]; description?: string; modifications?: string[] }) => void;
  currentUserAddress?: string;
  isOwner?: boolean;
  connectedPlatforms?: string[];
}

export function RegisteredVHCLPage({ 
  vehicleId, 
  vehicleData,
  onBack, 
  onUpdate,
  currentUserAddress,
  isOwner = false,
  connectedPlatforms = []
}: RegisteredVHCLPageProps) {
  const { addToast } = useToast();
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | undefined>(undefined);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingMods, setIsEditingMods] = useState(false);
  
  const [sponsorshipCollection, setSponsorshipCollection] = useState<{
    contractAddress: string;
    maxSupply: number;
    mintPrice: number;
    mintedCount?: number;
  } | null>(null);
  
  const initialDescription = vehicleData?.description || "";
  const initialMods = vehicleData?.modifications || [];
  const initialImages = vehicleData?.images || [{ url: "/Cars/R34GTR.jpg", isNftImage: true }];
  
  const [description, setDescription] = useState(initialDescription);
  const [modifications, setModifications] = useState<string[]>(initialMods);
  const [newMod, setNewMod] = useState("");
  const [images, setImages] = useState<VehicleImage[]>(initialImages);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vehicle: RegisteredVehicle = {
    _id: vehicleData?._id || vehicleId,
    nickname: vehicleData?.nickname || "",
    make: vehicleData?.make || "Unknown",
    model: vehicleData?.model || "Vehicle",
    year: vehicleData?.year || 2024,
    images: images,
    isUpgraded: vehicleData?.isUpgraded ?? false,
    location: "Los Angeles, CA",
    registryId: vehicleData?.registryId || "DRVN-0000",
    description: description,
    modifications: modifications,
    owner: {
      name: "gearhead_mike",
      username: "gearhead_mike",
      avatar: "/avatars/default.png",
    },
    followerCount: 1234,
    carToken: vehicleData?.carToken ? {
      address: vehicleData.carToken.address,
      ticker: vehicleData.carToken.ticker,
      price: 0.000045,
      change24h: 5.2,
      mcap: 45000,
    } : undefined,
    sponsorshipCollection: sponsorshipCollection || undefined,
    sponsors: sponsorshipCollection ? [
      { tokenId: "1", name: "BSTR", logo: "/Cars/BSTR-Logo-Official.png", holderAddress: "0xsp1..." },
      { tokenId: "2", name: "Base", logo: "/Cars/DCWhtV4.png", holderAddress: "0xsp2..." },
      { tokenId: "3", name: "Coinbase", logo: "/Cars/DRVNLaboLogoDrk.png", holderAddress: "0xsp3..." },
    ] : [],
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
  const availableSlotsCount = vehicle.sponsorshipCollection 
    ? vehicle.sponsorshipCollection.maxSupply - (vehicle.sponsorshipCollection.mintedCount || 0)
    : 0;
  const claimedSlotIds = vehicle.sponsors.map(s => parseInt(s.tokenId));
  const availableSlotIds = vehicle.sponsorshipCollection
    ? Array.from({ length: vehicle.sponsorshipCollection.maxSupply }, (_, i) => i + 1)
        .filter(id => !claimedSlotIds.includes(id))
    : [];
  const vehicleDisplayName = vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  const handleSponsorClick = () => {
    setShowSponsorModal(true);
  };

  const handleUpgradeComplete = () => {
    setShowUpgradeModal(false);
  };

  const handleCreateCollection = () => {
    setShowCreateCollectionModal(true);
  };

  const handleCollectionCreated = (collection: {
    contractAddress: string;
    maxSupply: number;
    mintPrice: number;
    stage: number;
  }) => {
    setSponsorshipCollection({
      contractAddress: collection.contractAddress,
      maxSupply: collection.maxSupply,
      mintPrice: collection.mintPrice,
      mintedCount: 0,
    });
    setShowCreateCollectionModal(false);
  };

  const handleShareCollection = () => {
    const text = `Looking for sponsors for my ${vehicleDisplayName}! Mint a sponsorship NFT for $${sponsorshipCollection?.mintPrice} USDC on @DRVN_VHCLS`;
    addToast({
      type: "info",
      title: "Share",
      message: "Opening share options...",
    });
    window.open(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  const handleSponsorSlotClick = (slotId?: number) => {
    if (isOwner) {
      setShowSponsorModal(true);
    } else {
      setSelectedSlot(slotId);
      setShowMintModal(true);
    }
  };

  const handleMintSuccess = (result: { tokenId: number; transactionHash: string }) => {
    setShowMintModal(false);
    setShowProfileEditor(true);
    setSelectedSponsor({
      tokenId: String(result.tokenId),
      name: "",
      holderAddress: currentUserAddress || "",
    });
  };

  const handleManageSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setShowProfileEditor(true);
  };

  const handleViewSponsor = (sponsor: Sponsor) => {
    addToast({
      type: "info",
      title: sponsor.name || "Sponsor",
      message: `Viewing sponsor details...`,
    });
  };

  const handleSaveProfile = (profile: Partial<Sponsor>) => {
    setShowProfileEditor(false);
    setSelectedSponsor(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const newImages = [...images, { url, isNftImage: false }];
        handleImageChange(newImages);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    if (images[index].isNftImage) return;
    const newImages = images.filter((_, i) => i !== index);
    handleImageChange(newImages);
  };

  const handleSetNftImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isNftImage: i === index
    }));
    handleImageChange(newImages);
  };

  const handleAddMod = () => {
    if (newMod.trim()) {
      setModifications(prev => [...prev, newMod.trim()]);
      setNewMod("");
    }
  };

  const handleRemoveMod = (index: number) => {
    setModifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    onUpdate?.({ description });
  };

  const handleSaveMods = () => {
    setIsEditingMods(false);
    onUpdate?.({ modifications });
  };

  const handleImageChange = (newImages: VehicleImage[]) => {
    setImages(newImages);
    onUpdate?.({ images: newImages });
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

      {isOwner && (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Manage Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={img.url}
                      alt={`Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {img.isNftImage && (
                    <div className="absolute -top-1 -left-1 bg-primary text-black text-[8px] font-bold px-1 rounded">
                      NFT
                    </div>
                  )}
                  {!img.isNftImage && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleSetNftImage(index)}
                        className="p-1 bg-primary/80 rounded text-black text-[10px] hover:bg-primary"
                        title="Set as NFT image"
                      >
                        NFT
                      </button>
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="p-1 bg-red-500/80 rounded text-white hover:bg-red-500"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center text-zinc-500 hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Click an image to set as NFT image or remove. NFT image updates on-chain metadata.
            </p>
          </CardContent>
        </Card>
      )}

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

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-primary" />
                  Description
                </CardTitle>
                {isOwner && !isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDescription(true)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-zinc-900/50 border-white/10 text-white min-h-[100px]"
                    placeholder="Describe your vehicle..."
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDescription}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-black"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditingDescription(false)}
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {description || "No description yet."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Modifications
                </CardTitle>
                {isOwner && !isEditingMods && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingMods(true)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingMods ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {modifications.map((mod, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-zinc-800 px-3 py-1.5 rounded-full text-sm text-white"
                      >
                        <span>{mod}</span>
                        <button
                          onClick={() => handleRemoveMod(index)}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMod}
                      onChange={(e) => setNewMod(e.target.value)}
                      placeholder="Add modification..."
                      className="bg-zinc-900/50 border-white/10 text-white flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddMod()}
                    />
                    <Button
                      onClick={handleAddMod}
                      size="sm"
                      variant="outline"
                      className="border-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveMods}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-black"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditingMods(false)}
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {modifications.length > 0 ? (
                    modifications.map((mod, index) => (
                      <span
                        key={index}
                        className="bg-zinc-800/50 px-3 py-1.5 rounded-full text-sm text-zinc-300 border border-white/5"
                      >
                        {mod}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-500">No modifications listed.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {vehicle.isUpgraded && (
            <SponsorshipModule
              vehicleName={vehicle.nickname || vehicle.model}
              vehicleTicker={vehicle.carToken?.ticker}
              isOwner={isOwner}
              isUpgraded={vehicle.isUpgraded}
              connectedAddress={currentUserAddress}
              sponsorshipCollection={vehicle.sponsorshipCollection}
              sponsors={vehicle.sponsors}
              onSponsorClick={handleSponsorSlotClick}
              onCreateCollection={handleCreateCollection}
              onShare={handleShareCollection}
              onManageSponsor={handleManageSponsor}
              onViewSponsor={handleViewSponsor}
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
        availableSlots={availableSlotsCount}
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

      {vehicle.carToken && (
        <CreateSponsorshipCollectionModal
          isOpen={showCreateCollectionModal}
          onClose={() => setShowCreateCollectionModal(false)}
          vehicleId={vehicle._id}
          vehicleName={vehicleDisplayName}
          vehicleTicker={vehicle.carToken.ticker}
          onCreationComplete={handleCollectionCreated}
          connectedPlatforms={connectedPlatforms}
        />
      )}

      {vehicle.sponsorshipCollection && (
        <MintSponsorshipModal
          isOpen={showMintModal}
          onClose={() => {
            setShowMintModal(false);
            setSelectedSlot(undefined);
          }}
          vehicleId={vehicle._id}
          vehicleName={vehicleDisplayName}
          vehicleImage={nftImage}
          mintPrice={vehicle.sponsorshipCollection.mintPrice}
          availableSlots={availableSlotIds}
          maxSupply={vehicle.sponsorshipCollection.maxSupply}
          benefits={[
            "Logo placement on vehicle wrap",
            "Social media mentions",
            "Cross-promotion opportunities",
            "Branded content features"
          ]}
          onMintSuccess={handleMintSuccess}
        />
      )}

      {selectedSponsor && (
        <SponsorProfileEditorModal
          isOpen={showProfileEditor}
          onClose={() => {
            setShowProfileEditor(false);
            setSelectedSponsor(null);
          }}
          sponsor={{
            tokenId: selectedSponsor.tokenId,
            name: selectedSponsor.name || "",
            logo: selectedSponsor.logo,
            holderAddress: selectedSponsor.holderAddress,
          }}
          vehicleName={vehicleDisplayName}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
