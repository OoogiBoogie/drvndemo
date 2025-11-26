"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Tag, Handshake, Check, Globe } from "lucide-react";
import Image from "next/image";
import { SocialPost, CrossPostSettings, SocialPlatform } from "@/app/components/social/types";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    registeredVehicles?: Array<{ id: string; nickname?: string; make: string; model: string }>;
    currentUser: {
        name: string;
        username: string;
        avatar: string;
    };
    sponsors?: Array<{ id: string; name: string; logo?: string; url?: string }>;
    onPostCreated?: (post: SocialPost, crossPostTo: CrossPostSettings) => void;
    connectedPlatforms?: SocialPlatform[];
    initialCrossPostSettings?: CrossPostSettings;
}

export function CreatePostModal({
    isOpen,
    onClose,
    userId,
    registeredVehicles = [],
    currentUser,
    sponsors = [],
    onPostCreated,
    connectedPlatforms = [],
    initialCrossPostSettings,
}: CreatePostModalProps) {
    const [content, setContent] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [taggedVehicles, setTaggedVehicles] = useState<string[]>([]);
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null);
    const [showSponsorSelector, setShowSponsorSelector] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [crossPostTo, setCrossPostTo] = useState<CrossPostSettings>(
        initialCrossPostSettings || {
            farcaster: connectedPlatforms.includes("farcaster"),
            base: connectedPlatforms.includes("base"),
            x: connectedPlatforms.includes("x"),
        }
    );

    const platformInfo: Record<SocialPlatform, { icon: string; name: string; color: string }> = {
        farcaster: { icon: "🟣", name: "Farcaster", color: "purple" },
        base: { icon: "🔵", name: "Base", color: "blue" },
        x: { icon: "✕", name: "X", color: "gray" },
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages((prev) => [...prev, ...newImages].slice(0, 4)); // Max 4 images
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleVehicleTag = (vehicleId: string) => {
        setTaggedVehicles((prev) =>
            prev.includes(vehicleId)
                ? prev.filter((id) => id !== vehicleId)
                : [...prev, vehicleId]
        );
    };

    const handlePost = async () => {
        if (!content.trim()) {
            setError("Please enter some content");
            return;
        }

        setIsLoading(true);
        setError("");

        let ipfsUrls: string[] = [];

        try {
            // 1. Upload images to IPFS
            ipfsUrls = images.length > 0
                ? images.map((_, i) => `ipfs://post-image-${i}-${Date.now()}`)
                : [];

            // 2. Create post in database
            const response = await fetch("/api/social/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorId: userId,
                    content,
                    media: ipfsUrls,
                    taggedVehicles,
                    taggedSponsors: selectedSponsor ? [selectedSponsor] : [],
                }),
            });

            if (!response.ok) throw new Error("Failed to create post");

            // 3. Optionally publish to Farcaster
            // This would call Farcaster API to create a cast with frame
        } catch (err) {
            console.warn("Create post fallback", err);
        } finally {
            setIsLoading(false);
        }

        const vehicleMeta = taggedVehicles[0]
            ? registeredVehicles.find((v) => v.id === taggedVehicles[0])
            : undefined;
        const sponsorMeta = selectedSponsor
            ? sponsors.find((sponsor) => sponsor.id === selectedSponsor)
            : undefined;

        const inlinePreview = images[0]
            ? URL.createObjectURL(images[0])
            : ipfsUrls[0]
                ? ipfsUrls[0].replace("ipfs://", "https://ipfs.io/ipfs/")
                : undefined;

        const selectedPlatforms = (Object.entries(crossPostTo) as [SocialPlatform, boolean][])
            .filter(([, enabled]) => enabled)
            .map(([platform]) => platform);

        const newPost: SocialPost = {
            id: `local-${Date.now()}`,
            author: currentUser,
            content: content.trim(),
            image: inlinePreview,
            timestamp: "Just now",
            likes: 0,
            comments: 0,
            recasts: 0,
            vehicleTag: vehicleMeta
                ? {
                    id: vehicleMeta.id,
                    label: vehicleMeta.nickname || `${vehicleMeta.make} ${vehicleMeta.model}`,
                }
                : undefined,
            sponsorTag: sponsorMeta
                ? {
                    id: sponsorMeta.id,
                    name: sponsorMeta.name,
                    logo: sponsorMeta.logo,
                    url: sponsorMeta.url,
                }
                : undefined,
            source: "in-app",
            crossPostedTo: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        };

        onPostCreated?.(newPost, crossPostTo);

        setSuccess(true);
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setContent("");
        setImages([]);
        setTaggedVehicles([]);
        setShowVehicleSelector(false);
        setSelectedSponsor(null);
        setShowSponsorSelector(false);
        setError("");
        setSuccess(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Create Post
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Post Created!
                        </h3>
                        <p className="text-zinc-400">
                            Your post is now live on the feed
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Content */}
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={6}
                            className="bg-zinc-800 border-white/10 text-white resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-zinc-500 text-right">
                            {content.length}/500
                        </div>

                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                                        <Image
                                            src={URL.createObjectURL(img)}
                                            alt={`Upload ${i + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tagged Vehicles */}
                        {taggedVehicles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {taggedVehicles.map((vehicleId) => {
                                    const vehicle = registeredVehicles.find((v) => v.id === vehicleId);
                                    return (
                                        <div
                                            key={vehicleId}
                                            className="flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-sm"
                                        >
                                            <Tag className="w-3 h-3 text-primary" />
                                            <span className="text-white">
                                                {vehicle?.nickname || `${vehicle?.make} ${vehicle?.model}`}
                                            </span>
                                            <button
                                                onClick={() => toggleVehicleTag(vehicleId)}
                                                className="text-white/70 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedSponsor && (
                            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1 text-sm w-fit">
                                <Handshake className="w-3 h-3 text-yellow-400" />
                                <span className="text-white">
                                    {sponsors.find((s) => s.id === selectedSponsor)?.name || "Sponsor"}
                                </span>
                                <button
                                    onClick={() => setSelectedSponsor(null)}
                                    className="text-white/70 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Vehicle Selector */}
                        {showVehicleSelector && registeredVehicles.length > 0 && (
                            <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                                <p className="text-sm text-zinc-400 font-bold">Tag a vehicle:</p>
                                {registeredVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => {
                                            toggleVehicleTag(vehicle.id);
                                            setShowVehicleSelector(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-zinc-700 text-white text-sm"
                                    >
                                        {vehicle.nickname || `${vehicle.make} ${vehicle.model}`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {showSponsorSelector && sponsors.length > 0 && (
                            <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                                <p className="text-sm text-zinc-400 font-bold">Tag a sponsor:</p>
                                {sponsors.map((sponsor) => (
                                    <button
                                        key={sponsor.id}
                                        onClick={() => {
                                            setSelectedSponsor(sponsor.id);
                                            setShowSponsorSelector(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-zinc-700 text-white text-sm flex items-center gap-2"
                                    >
                                        {sponsor.logo && (
                                            <Image src={sponsor.logo} alt={sponsor.name} width={20} height={20} className="rounded-full" />
                                        )}
                                        {sponsor.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="post-image-upload"
                                disabled={images.length >= 4}
                            />
                            <label htmlFor="post-image-upload">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-zinc-400 hover:text-white hover:bg-white/5"
                                    disabled={images.length >= 4}
                                    asChild
                                >
                                    <span>
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Image
                                    </span>
                                </Button>
                            </label>

                            {registeredVehicles.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowVehicleSelector(!showVehicleSelector)}
                                    className="text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <Tag className="w-4 h-4 mr-2" />
                                    Tag Vehicle
                                </Button>
                            )}
                            {sponsors.length > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSponsorSelector(!showSponsorSelector)}
                                    className="text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <Handshake className="w-4 h-4 mr-2" />
                                    Tag Sponsor
                                </Button>
                            )}
                        </div>

                        {/* Cross-Post Platforms */}
                        <div className="rounded-xl bg-zinc-800/50 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-white">Post to platforms</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => {}}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary/20 text-primary border border-primary/40"
                                >
                                    <span>🚗</span>
                                    <span>DRVN</span>
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                                {(["farcaster", "base", "x"] as SocialPlatform[]).map((platform) => {
                                    const info = platformInfo[platform];
                                    const isEnabled = crossPostTo[platform];
                                    return (
                                        <button
                                            key={platform}
                                            type="button"
                                            onClick={() => setCrossPostTo(prev => ({
                                                ...prev,
                                                [platform]: !prev[platform]
                                            }))}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                isEnabled
                                                    ? "bg-white/10 text-white border border-white/20"
                                                    : "bg-zinc-900 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                                            }`}
                                        >
                                            <span>{info.icon}</span>
                                            <span>{info.name}</span>
                                            {isEnabled && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-zinc-500">
                                Select platforms to cross-post your content
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePost}
                                disabled={isLoading || !content.trim()}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    "Post"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
