"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { 
  X, 
  Globe, 
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ManageSponsorshipModal } from "./ManageSponsorshipModal";
import { useAccount } from "wagmi";

interface SponsorSocialLinks {
  base?: string;
  x?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
}

interface SponsorDetails {
  tokenId: string;
  name: string;
  logo?: string;
  holderAddress: string;
  websiteUrl?: string;
  promoUrl?: string;
  socialLinks?: SponsorSocialLinks;
  bio?: string;
  gallery?: string[];
  openSeaUrl?: string;
}

interface SponsorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorDetails | null;
  vehicleName?: string;
}

export function SponsorDetailsModal({ 
  isOpen, 
  onClose, 
  sponsor,
  vehicleName 
}: SponsorDetailsModalProps) {
  const { address } = useAccount();
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showManageModal, setShowManageModal] = useState(false);

  // Reset gallery index when sponsor changes
  useEffect(() => {
    if (isOpen) {
      setCurrentGalleryIndex(0);
      setShowManageModal(false);
    }
  }, [sponsor?.tokenId, isOpen]);

  if (!sponsor) return null;

  const isHolder = address?.toLowerCase() === sponsor.holderAddress?.toLowerCase();

  const nextImage = () => {
    if (sponsor.gallery && sponsor.gallery.length > 1) {
      setCurrentGalleryIndex((prev) => 
        prev === sponsor.gallery!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (sponsor.gallery && sponsor.gallery.length > 1) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? sponsor.gallery!.length - 1 : prev - 1
      );
    }
  };

  const socialIcons: { key: keyof SponsorSocialLinks; label: string; icon: string }[] = [
    { key: "base", label: "Base", icon: "/Cars/base-logo.png" },
    { key: "x", label: "X", icon: "/Cars/XIcon.png" },
    { key: "instagram", label: "Instagram", icon: "instagram" },
    { key: "facebook", label: "Facebook", icon: "facebook" },
    { key: "youtube", label: "YouTube", icon: "youtube" },
    { key: "tiktok", label: "TikTok", icon: "tiktok" },
    { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  ];

  const handleBrandingUpdate = (branding: {
    name?: string;
    logo?: string;
    bio?: string;
    website?: string;
    twitter?: string;
    instagram?: string;
    photos?: string[];
  }) => {
    console.log("Branding updated:", branding);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          className="max-w-2xl w-[95vw] max-h-[90vh] p-0 bg-white/[0.03] backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50"
          aria-describedby="sponsor-detail-description"
          hideCloseButton
        >
          <VisuallyHidden>
            <DialogTitle>{sponsor.name} - Sponsor Details</DialogTitle>
            <DialogDescription id="sponsor-detail-description">
              View details for {sponsor.name}, a sponsor of {vehicleName}
            </DialogDescription>
          </VisuallyHidden>

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-mono">Sponsor Details</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-65px)] p-5 md:p-6 sleek-scrollbar space-y-6">
            
            {/* Sponsor Logo & Name */}
            <div className="flex items-center gap-5">
              <Avatar className="w-24 h-24 md:w-28 md:h-28 border-2 border-white/10 rounded-2xl shadow-xl">
                <AvatarImage src={sponsor.logo} className="object-cover" />
                <AvatarFallback className="bg-white/5 backdrop-blur rounded-2xl text-2xl font-bold text-white/50">
                  {sponsor.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{sponsor.name}</h3>
                <p className="text-sm text-zinc-500">
                  Sponsorship #{sponsor.tokenId}
                </p>
              </div>
            </div>

            {/* Links Section */}
            {(sponsor.websiteUrl || sponsor.promoUrl) && (
              <div className="flex flex-wrap gap-3">
                {sponsor.websiteUrl && (
                  <a 
                    href={sponsor.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-white transition-all"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                    <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                )}
                {sponsor.promoUrl && (
                  <a 
                    href={sponsor.promoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full text-sm text-primary transition-all"
                  >
                    <Tag className="w-4 h-4" />
                    Promo Link
                    <ExternalLink className="w-3 h-3 text-primary/70" />
                  </a>
                )}
              </div>
            )}

            {/* Social Accounts */}
            {sponsor.socialLinks && Object.values(sponsor.socialLinks).some(v => v) && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Social Accounts</h4>
                <div className="flex flex-wrap gap-2">
                  {socialIcons.map(({ key, label, icon }) => {
                    const url = sponsor.socialLinks?.[key];
                    if (!url) return null;
                    
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-all"
                      >
                        {icon.startsWith("/") ? (
                          <Image src={icon} alt={label} width={16} height={16} className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center text-xs">
                            {label.substring(0, 2)}
                          </span>
                        )}
                        {label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bio */}
            {sponsor.bio && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">About</h4>
                <p className="text-white/80 text-sm leading-relaxed bg-white/5 border border-white/5 rounded-xl p-4">
                  {sponsor.bio}
                </p>
              </div>
            )}

            {/* Photo Gallery */}
            {sponsor.gallery && sponsor.gallery.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Gallery</h4>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                  <Image
                    src={sponsor.gallery[currentGalleryIndex]}
                    alt={`${sponsor.name} gallery image ${currentGalleryIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navigation */}
                  {sponsor.gallery.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      {/* Dot indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1.5 rounded-full">
                        {sponsor.gallery.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentGalleryIndex(idx)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              idx === currentGalleryIndex ? "bg-white w-4" : "bg-white/40 hover:bg-white/70 w-1.5"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Image counter */}
                  <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white/90 font-mono border border-white/10">
                    {currentGalleryIndex + 1} / {sponsor.gallery.length}
                  </div>
                </div>
              </div>
            )}

            {/* OpenSea Link */}
            {sponsor.openSeaUrl && (
              <a
                href={sponsor.openSeaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#2081E2]/10 hover:bg-[#2081E2]/20 border border-[#2081E2]/30 rounded-xl text-[#2081E2] font-medium transition-all"
              >
                <Image src="/opensea.svg" alt="OpenSea" width={20} height={20} className="w-5 h-5" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                View NFT on OpenSea
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Manage Sponsorship Button - Only for NFT Holder */}
            {isHolder && (
              <Button
                onClick={() => setShowManageModal(true)}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Sponsorship
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Sponsorship Modal */}
      <ManageSponsorshipModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        sponsorshipId={sponsor.tokenId}
        currentBranding={{
          name: sponsor.name,
          logo: sponsor.logo,
          bio: sponsor.bio,
          website: sponsor.websiteUrl,
          twitter: sponsor.socialLinks?.x,
          instagram: sponsor.socialLinks?.instagram,
          photos: sponsor.gallery,
        }}
        onBrandingUpdate={handleBrandingUpdate}
      />
    </>
  );
}
