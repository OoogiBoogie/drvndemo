"use client";

import { useState } from "react";
import { X, Upload, Save, Loader2, Check, Trash2, Plus, Link2, Instagram, Youtube } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import Image from "next/image";
import { useToast } from "@/app/components/ui/toast-context";

interface SocialLinks {
  x?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  facebook?: string;
}

interface SponsorProfile {
  tokenId: string;
  name: string;
  logo?: string;
  bio?: string;
  website?: string;
  promoLink?: string;
  socialLinks?: SocialLinks;
  galleryImages?: string[];
  holderAddress: string;
}

interface SponsorProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorProfile;
  vehicleName: string;
  onSave?: (profile: Partial<SponsorProfile>) => void;
}

export function SponsorProfileEditorModal({
  isOpen,
  onClose,
  sponsor,
  vehicleName,
  onSave
}: SponsorProfileEditorModalProps) {
  const [name, setName] = useState(sponsor.name || "");
  const [bio, setBio] = useState(sponsor.bio || "");
  const [website, setWebsite] = useState(sponsor.website || "");
  const [promoLink, setPromoLink] = useState(sponsor.promoLink || "");
  const [logo, setLogo] = useState(sponsor.logo || "");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(sponsor.socialLinks || {});
  const [galleryImages, setGalleryImages] = useState<string[]>(sponsor.galleryImages || []);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleAddGalleryImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setGalleryImages(prev => [...prev, url]);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedProfile: Partial<SponsorProfile> = {
      tokenId: sponsor.tokenId,
      name,
      bio,
      website,
      promoLink,
      logo,
      socialLinks,
      galleryImages
    };
    
    onSave?.(updatedProfile);
    
    addToast({
      type: "success",
      title: "Profile Updated",
      message: "Your sponsor profile has been saved!",
    });
    
    setIsSaving(false);
    onClose();
  };

  const socialPlatforms: { key: keyof SocialLinks; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: "x", label: "X (Twitter)", icon: <span className="text-lg">𝕏</span>, placeholder: "https://x.com/username" },
    { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, placeholder: "https://instagram.com/username" },
    { key: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, placeholder: "https://youtube.com/@channel" },
    { key: "tiktok", label: "TikTok", icon: <span className="text-lg">♪</span>, placeholder: "https://tiktok.com/@username" },
    { key: "linkedin", label: "LinkedIn", icon: <span className="text-lg font-bold">in</span>, placeholder: "https://linkedin.com/in/username" },
    { key: "facebook", label: "Facebook", icon: <span className="text-lg">f</span>, placeholder: "https://facebook.com/page" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-zinc-900 border-b border-white/10 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Sponsor Profile</h2>
            <p className="text-sm text-zinc-400">Slot #{sponsor.tokenId} on {vehicleName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <p className="text-sm font-medium text-zinc-400 mb-2">Logo</p>
              <div className="relative w-24 h-24 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden group">
                {logo ? (
                  <>
                    <Image
                      src={logo}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setLogo("")}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      const url = prompt("Enter logo URL:");
                      if (url) setLogo(url);
                    }}
                    className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-xs">Upload</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-1 block">Sponsor Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your brand name"
                  className="bg-zinc-800 border-white/10"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400 mb-1 block">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your brand..."
                  className="bg-zinc-800 border-white/10 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-zinc-800 border-white/10"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Promo Link
              </label>
              <Input
                value={promoLink}
                onChange={(e) => setPromoLink(e.target.value)}
                placeholder="https://promo.yourwebsite.com"
                className="bg-zinc-800 border-white/10"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-3">Social Links</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    {platform.icon}
                  </div>
                  <Input
                    value={socialLinks[platform.key] || ""}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="flex-1 bg-zinc-800 border-white/10 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-zinc-400">Gallery Images</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddGalleryImage}
                className="text-primary hover:text-primary/80"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </Button>
            </div>
            
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 group"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-xl p-8 text-center">
                <p className="text-sm text-zinc-500">No gallery images yet</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-2">OpenSea NFT Link</p>
            <a
              href={`https://opensea.io/assets/base/collection/drvn-sponsorship/${sponsor.tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View on OpenSea →
            </a>
          </div>
        </div>

        <div className="sticky bottom-0 bg-zinc-900 border-t border-white/10 p-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
