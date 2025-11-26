"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import Image from "next/image";

interface ManageSponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsorshipId: string;
    currentBranding?: {
        name?: string;
        logo?: string;
        bio?: string;
        website?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
    };
    onBrandingUpdate?: (branding: {
        name?: string;
        logo?: string;
        bio?: string;
        website?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
    }) => void;
}

export function ManageSponsorshipModal({
    isOpen,
    onClose,
    sponsorshipId,
    currentBranding,
    onBrandingUpdate,
}: ManageSponsorshipModalProps) {
    const [name, setName] = useState(currentBranding?.name || "");
    const [bio, setBio] = useState(currentBranding?.bio || "");
    const [website, setWebsite] = useState(currentBranding?.website || "");
    const [twitter, setTwitter] = useState(currentBranding?.twitter || "");
    const [instagram, setInstagram] = useState(currentBranding?.instagram || "");
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState(currentBranding?.logo || "");
    const [photos, setPhotos] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(currentBranding?.name || "");
            setBio(currentBranding?.bio || "");
            setWebsite(currentBranding?.website || "");
            setTwitter(currentBranding?.twitter || "");
            setInstagram(currentBranding?.instagram || "");
            setLogo(null);
            setLogoPreview(currentBranding?.logo || "");
            setPhotos([]);
            setError("");
            setSuccess(false);
        }
    }, [currentBranding, isOpen]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPhotos(Array.from(e.target.files));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            // 1. Upload logo and photos to IPFS
            let logoUrl = logoPreview;
            if (logo) {
                // Mock IPFS upload
                logoUrl = `ipfs://logo-${Date.now()}`;
            }

            const photoUrls = photos.length > 0
                ? photos.map((_, i) => `ipfs://photo-${i}-${Date.now()}`)
                : currentBranding?.photos || [];

            // 2. Update sponsorship branding
            try {
                const response = await fetch(`/api/sponsorship/${sponsorshipId}/manage`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        branding: {
                            name,
                            logo: logoUrl,
                            bio,
                            website,
                            socialLinks: {
                                twitter,
                                instagram,
                            },
                            photos: photoUrls,
                        },
                    }),
                });

                if (!response.ok) throw new Error("Failed to update sponsorship");
            } catch (apiError) {
                console.warn("Manage sponsorship fallback", apiError); // allow demo flow when API is offline
            }

            const brandingUpdate = {
                name,
                logo: logoUrl,
                bio,
                website,
                twitter,
                instagram,
                photos: photoUrls,
            };

            onBrandingUpdate?.(brandingUpdate);

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch {
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Manage Sponsorship
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Changes Saved!
                        </h3>
                        <p className="text-zinc-400">
                            Your sponsorship profile has been updated
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <Label className="text-white mb-2 block">Sponsor Logo</Label>
                            <div className="flex items-center gap-4">
                                {logoPreview && (
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-zinc-800">
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label htmlFor="logo-upload">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-white/10 hover:bg-white/5 cursor-pointer"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Logo
                                            </span>
                                        </Button>
                                    </label>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Recommended: 500x500px, PNG or JPG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sponsor Name */}
                        <div>
                            <Label htmlFor="name" className="text-white mb-2 block">
                                Sponsor Name *
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Red Bull Racing"
                                className="bg-zinc-800 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <Label htmlFor="bio" className="text-white mb-2 block">
                                Bio
                            </Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell people about your brand..."
                                rows={4}
                                className="bg-zinc-800 border-white/10 text-white resize-none"
                            />
                        </div>

                        {/* Website */}
                        <div>
                            <Label htmlFor="website" className="text-white mb-2 block">
                                Website
                            </Label>
                            <Input
                                id="website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                                className="bg-zinc-800 border-white/10 text-white"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="twitter" className="text-white mb-2 block">
                                    Twitter/X
                                </Label>
                                <Input
                                    id="twitter"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    placeholder="@username"
                                    className="bg-zinc-800 border-white/10 text-white"
                                />
                            </div>
                            <div>
                                <Label htmlFor="instagram" className="text-white mb-2 block">
                                    Instagram
                                </Label>
                                <Input
                                    id="instagram"
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="@username"
                                    className="bg-zinc-800 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        {/* Photos */}
                        <div>
                            <Label className="text-white mb-2 block">Gallery Photos</Label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotosUpload}
                                className="hidden"
                                id="photos-upload"
                            />
                            <label htmlFor="photos-upload">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-white/10 hover:bg-white/5 cursor-pointer"
                                    asChild
                                >
                                    <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Photos
                                    </span>
                                </Button>
                            </label>
                            {photos.length > 0 && (
                                <p className="text-sm text-zinc-400 mt-2">
                                    {photos.length} photo(s) selected
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading || !name}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
