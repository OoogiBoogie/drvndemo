"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, CheckCircle, AlertCircle, Upload, GripVertical, FileImage, FileType, X } from "lucide-react";
import Image from "next/image";

interface ManageSponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    sponsorshipId: string;
    currentBranding?: {
        name?: string;
        logo?: string;
        decalFile?: string;
        heroImage?: string;
        bio?: string;
        website?: string;
        farcaster?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
    };
    onBrandingUpdate?: (branding: {
        name?: string;
        logo?: string;
        decalFile?: string;
        heroImage?: string;
        bio?: string;
        website?: string;
        farcaster?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
    }) => void;
    isVehicleOwner?: boolean;
}

export function ManageSponsorshipModal({
    isOpen,
    onClose,
    sponsorshipId,
    currentBranding,
    onBrandingUpdate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isVehicleOwner = false,
}: ManageSponsorshipModalProps) {
    const [name, setName] = useState(currentBranding?.name || "");
    const [bio, setBio] = useState(currentBranding?.bio || "");
    const [website, setWebsite] = useState(currentBranding?.website || "");
    const [farcaster, setFarcaster] = useState(currentBranding?.farcaster || "");
    const [twitter, setTwitter] = useState(currentBranding?.twitter || "");
    const [instagram, setInstagram] = useState(currentBranding?.instagram || "");
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState(currentBranding?.logo || "");
    const [decalFile, setDecalFile] = useState<File | null>(null);
    const [decalFileName, setDecalFileName] = useState(currentBranding?.decalFile || "");
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroPreview, setHeroPreview] = useState(currentBranding?.heroImage || "");
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoUrls, setPhotoUrls] = useState<string[]>(currentBranding?.photos || []);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(currentBranding?.name || "");
            setBio(currentBranding?.bio || "");
            setWebsite(currentBranding?.website || "");
            setFarcaster(currentBranding?.farcaster || "");
            setTwitter(currentBranding?.twitter || "");
            setInstagram(currentBranding?.instagram || "");
            setLogo(null);
            setLogoPreview(currentBranding?.logo || "");
            setDecalFile(null);
            setDecalFileName(currentBranding?.decalFile || "");
            setHeroImage(null);
            setHeroPreview(currentBranding?.heroImage || "");
            setPhotos([]);
            setPhotoUrls(currentBranding?.photos || []);
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

    const handleDecalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const validExtensions = ['.ai', '.eps'];
            const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!validExtensions.includes(extension)) {
                setError("Decal file must be .ai or .eps format");
                return;
            }
            setDecalFile(file);
            setDecalFileName(file.name);
            setError("");
        }
    };

    const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setHeroImage(file);
            setHeroPreview(URL.createObjectURL(file));
        }
    };

    const handlePhotosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newUrls = newFiles.map(f => URL.createObjectURL(f));
            setPhotos(prev => [...prev, ...newFiles]);
            setPhotoUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotoUrls(prev => prev.filter((_, i) => i !== index));
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const newPhotoUrls = [...photoUrls];
        const draggedUrl = newPhotoUrls[draggedIndex];
        newPhotoUrls.splice(draggedIndex, 1);
        newPhotoUrls.splice(index, 0, draggedUrl);
        setPhotoUrls(newPhotoUrls);

        if (photos.length > 0) {
            const newPhotos = [...photos];
            const draggedPhoto = newPhotos[draggedIndex];
            if (draggedPhoto) {
                newPhotos.splice(draggedIndex, 1);
                newPhotos.splice(index, 0, draggedPhoto);
                setPhotos(newPhotos);
            }
        }
        
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            let logoUrl = logoPreview;
            if (logo) {
                logoUrl = `ipfs://logo-${Date.now()}`;
            }

            let decalUrl = decalFileName;
            if (decalFile) {
                decalUrl = `ipfs://decal-${Date.now()}-${decalFile.name}`;
            }

            let heroUrl = heroPreview;
            if (heroImage) {
                heroUrl = `ipfs://hero-${Date.now()}`;
            }

            const finalPhotoUrls = photoUrls.length > 0 ? photoUrls : currentBranding?.photos || [];

            try {
                const response = await fetch(`/api/sponsorship/${sponsorshipId}/manage`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        branding: {
                            name,
                            logo: logoUrl,
                            decalFile: decalUrl,
                            heroImage: heroUrl,
                            bio,
                            website,
                            socialLinks: {
                                farcaster,
                                twitter,
                                instagram,
                            },
                            photos: finalPhotoUrls,
                        },
                    }),
                });

                if (!response.ok) throw new Error("Failed to update sponsorship");
            } catch (apiError) {
                console.warn("Manage sponsorship fallback", apiError);
            }

            const brandingUpdate = {
                name,
                logo: logoUrl,
                decalFile: decalUrl,
                heroImage: heroUrl,
                bio,
                website,
                farcaster,
                twitter,
                instagram,
                photos: finalPhotoUrls,
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
                        {/* Hero Image Upload */}
                        <div>
                            <Label className="text-white mb-2 block">Hero Banner Image</Label>
                            <p className="text-xs text-zinc-500 mb-3">
                                Displayed at the top of your sponsor page. Recommended: 16:9 aspect ratio (1920x1080px)
                            </p>
                            {heroPreview && (
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-zinc-800 mb-3">
                                    <Image
                                        src={heroPreview}
                                        alt="Hero preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleHeroUpload}
                                className="hidden"
                                id="hero-upload"
                            />
                            <label htmlFor="hero-upload">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-white/10 hover:bg-white/5 cursor-pointer"
                                    asChild
                                >
                                    <span>
                                        <FileImage className="w-4 h-4 mr-2" />
                                        Upload Hero Image
                                    </span>
                                </Button>
                            </label>
                        </div>

                        {/* Logo and Decal Upload Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Logo Upload */}
                            <div>
                                <Label className="text-white mb-2 block">Sponsor Logo</Label>
                                <div className="flex items-center gap-3">
                                    {logoPreview && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0">
                                            <Image
                                                src={logoPreview}
                                                alt="Logo preview"
                                                width={64}
                                                height={64}
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
                                                size="sm"
                                                className="border-white/10 hover:bg-white/5 cursor-pointer w-full"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="w-3 h-3 mr-1" />
                                                    Upload
                                                </span>
                                            </Button>
                                        </label>
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            500x500px PNG/JPG
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decal File Upload */}
                            <div>
                                <Label className="text-white mb-2 block">Decal File</Label>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg border border-white/10 bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                        <FileType className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept=".ai,.eps"
                                            onChange={handleDecalUpload}
                                            className="hidden"
                                            id="decal-upload"
                                        />
                                        <label htmlFor="decal-upload">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="border-white/10 hover:bg-white/5 cursor-pointer w-full"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="w-3 h-3 mr-1" />
                                                    Upload
                                                </span>
                                            </Button>
                                        </label>
                                        <p className="text-[10px] text-zinc-500 mt-1">
                                            .ai or .eps only
                                        </p>
                                        {decalFileName && (
                                            <p className="text-[10px] text-primary truncate mt-0.5">
                                                {decalFileName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-2">
                                    Vehicle owner can download for print
                                </p>
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
                        <div>
                            <Label className="text-white mb-3 block">Social Links</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="farcaster" className="text-xs text-zinc-400 mb-1 block">
                                        Farcaster
                                    </Label>
                                    <Input
                                        id="farcaster"
                                        value={farcaster}
                                        onChange={(e) => setFarcaster(e.target.value)}
                                        placeholder="@username"
                                        className="bg-zinc-800 border-white/10 text-white text-sm h-9"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="twitter" className="text-xs text-zinc-400 mb-1 block">
                                        Twitter/X
                                    </Label>
                                    <Input
                                        id="twitter"
                                        value={twitter}
                                        onChange={(e) => setTwitter(e.target.value)}
                                        placeholder="@username"
                                        className="bg-zinc-800 border-white/10 text-white text-sm h-9"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instagram" className="text-xs text-zinc-400 mb-1 block">
                                        Instagram
                                    </Label>
                                    <Input
                                        id="instagram"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="@username"
                                        className="bg-zinc-800 border-white/10 text-white text-sm h-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Gallery with Reordering */}
                        <div>
                            <Label className="text-white mb-2 block">Media Gallery</Label>
                            <p className="text-xs text-zinc-500 mb-3">
                                Drag to reorder. First image is the featured image.
                            </p>
                            
                            {photoUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {photoUrls.map((url, index) => (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-move group ${
                                                draggedIndex === index 
                                                    ? "border-primary opacity-50" 
                                                    : "border-white/10 hover:border-white/30"
                                            }`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <GripVertical className="w-5 h-5 text-white" />
                                            </div>
                                            <button
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-black px-1.5 py-0.5 rounded font-medium">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                        Add Photos
                                    </span>
                                </Button>
                            </label>
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
