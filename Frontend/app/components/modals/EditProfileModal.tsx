"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import Image from "next/image";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    currentProfile: {
        displayName?: string;
        bio?: string;
        profileImage?: string;
        socialLinks?: {
            base?: string;
            x?: string;
            instagram?: string;
            facebook?: string;
            youtube?: string;
            tiktok?: string;
            linkedin?: string;
        };
    };
}

export function EditProfileModal({
    isOpen,
    onClose,
    userId,
    currentProfile,
}: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState(currentProfile.displayName || "");
    const [bio, setBio] = useState(currentProfile.bio || "");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState(currentProfile.profileImage || "");
    const [socialLinks, setSocialLinks] = useState(currentProfile.socialLinks || {});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSocialLinkChange = (platform: string, value: string) => {
        setSocialLinks((prev) => ({ ...prev, [platform]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            // 1. Upload profile image to IPFS if changed
            let imageUrl = profileImagePreview;
            if (profileImage) {
                // Mock IPFS upload
                imageUrl = `ipfs://profile-${Date.now()}`;
            }

            // 2. Update user profile
            const response = await fetch(`/api/users/${userId}/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName,
                    bio,
                    profileImage: imageUrl,
                    socialLinks,
                }),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Refresh page or invalidate query to show updated profile
                window.location.reload();
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
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Profile Updated!
                        </h3>
                        <p className="text-zinc-400">
                            Your changes have been saved
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Profile Image */}
                        <div>
                            <Label className="text-white mb-2 block">Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                {profileImagePreview && (
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-zinc-800">
                                        <Image
                                            src={profileImagePreview}
                                            alt="Profile preview"
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
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="profile-image-upload"
                                    />
                                    <label htmlFor="profile-image-upload">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-white/10 hover:bg-white/5 cursor-pointer"
                                            asChild
                                        >
                                            <span>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Photo
                                            </span>
                                        </Button>
                                    </label>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Recommended: 400x400px, PNG or JPG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <Label htmlFor="displayName" className="text-white mb-2 block">
                                Display Name
                            </Label>
                            <Input
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your display name"
                                className="bg-zinc-800 border-white/10 text-white"
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
                                placeholder="Tell us about yourself..."
                                rows={4}
                                maxLength={200}
                                className="bg-zinc-800 border-white/10 text-white resize-none"
                            />
                            <p className="text-xs text-zinc-500 mt-1 text-right">
                                {bio.length}/200
                            </p>
                        </div>

                        {/* Social Links */}
                        <div>
                            <Label className="text-white mb-3 block">Social Links</Label>
                            <div className="space-y-3">
                                <div>
                                    <Label htmlFor="base" className="text-zinc-400 text-xs mb-1 block">
                                        Base Profile
                                    </Label>
                                    <Input
                                        id="base"
                                        value={socialLinks.base || ""}
                                        onChange={(e) => handleSocialLinkChange("base", e.target.value)}
                                        placeholder="base.org/username"
                                        className="bg-zinc-800 border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="x" className="text-zinc-400 text-xs mb-1 block">
                                        X (Twitter)
                                    </Label>
                                    <Input
                                        id="x"
                                        value={socialLinks.x || ""}
                                        onChange={(e) => handleSocialLinkChange("x", e.target.value)}
                                        placeholder="@username"
                                        className="bg-zinc-800 border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instagram" className="text-zinc-400 text-xs mb-1 block">
                                        Instagram
                                    </Label>
                                    <Input
                                        id="instagram"
                                        value={socialLinks.instagram || ""}
                                        onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                                        placeholder="@username"
                                        className="bg-zinc-800 border-white/10 text-white"
                                    />
                                </div>
                            </div>
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
                                disabled={isLoading}
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
