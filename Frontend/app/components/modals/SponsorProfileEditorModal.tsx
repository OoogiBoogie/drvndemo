"use client";

import { useState } from "react";
import { X, Upload, Save, Loader2, Check, Trash2, Plus, Link2, Instagram, Youtube, Settings, ExternalLink } from "lucide-react";
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

  const socialPlatforms: { key: keyof SocialLinks; label: string; icon: React.ReactNode; placeholder: string; color: string }[] = [
    { key: "x", label: "X", icon: <span className="text-sm font-bold">𝕏</span>, placeholder: "x.com/username", color: "bg-white/10" },
    { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, placeholder: "instagram.com/username", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
    { key: "youtube", label: "YouTube", icon: <Youtube className="w-4 h-4" />, placeholder: "youtube.com/@channel", color: "bg-red-500" },
    { key: "tiktok", label: "TikTok", icon: <span className="text-sm">♪</span>, placeholder: "tiktok.com/@username", color: "bg-black" },
    { key: "linkedin", label: "LinkedIn", icon: <span className="text-sm font-bold">in</span>, placeholder: "linkedin.com/in/username", color: "bg-blue-600" },
    { key: "facebook", label: "Facebook", icon: <span className="text-sm font-bold">f</span>, placeholder: "facebook.com/page", color: "bg-blue-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative sticky top-0 bg-gradient-to-b from-zinc-900 to-zinc-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Manage Sponsorship</h2>
              <p className="text-sm text-zinc-400">Slot #{sponsor.tokenId} on {vehicleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0">
              <p className="text-sm font-medium text-zinc-400 mb-3">Brand Logo</p>
              <div className="relative w-28 h-28 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 overflow-hidden group">
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
                      className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
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
                    className="w-full h-full flex flex-col items-center justify-center text-zinc-500 hover:text-yellow-500 transition-colors"
                  >
                    <Upload className="w-7 h-7 mb-2" />
                    <span className="text-xs font-medium">Upload Logo</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Sponsor Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your brand name"
                  className="h-12 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your brand..."
                  className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 min-h-[100px] focus:border-yellow-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-12 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Promo Link
              </label>
              <Input
                value={promoLink}
                onChange={(e) => setPromoLink(e.target.value)}
                placeholder="https://promo.yoursite.com"
                className="h-12 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus:border-yellow-500/50"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-4">Social Links</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {socialPlatforms.map((platform) => (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {platform.icon}
                  </div>
                  <Input
                    value={socialLinks[platform.key] || ""}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="flex-1 h-10 bg-black/40 border-white/10 text-white text-sm placeholder:text-zinc-600 focus:border-yellow-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-400">Gallery Images</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddGalleryImage}
                className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
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
                    className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 group"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center">
                <p className="text-sm text-zinc-500">No gallery images yet</p>
                <p className="text-xs text-zinc-600 mt-1">Add photos to showcase your brand</p>
              </div>
            )}
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">OpenSea NFT</p>
                <p className="text-sm text-white font-medium">DRVN Sponsorship #{sponsor.tokenId}</p>
              </div>
              <a
                href={`https://opensea.io/assets/base/collection/drvn-sponsorship/${sponsor.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-yellow-500"
              >
                View on OpenSea
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="relative sticky bottom-0 bg-gradient-to-t from-black to-black/95 backdrop-blur-sm border-t border-white/10 p-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 border border-white/10 hover:bg-white/5"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
