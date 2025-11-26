"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
    FaTwitter,
    FaInstagram,
    FaFacebook,
    FaYoutube,
    FaTiktok,
    FaLinkedin
} from "react-icons/fa";
import { SiFarcaster } from "react-icons/si"; // Using generic icon for Base/Farcaster if specific not available or just map manually
import { Edit, UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";

interface SocialLinks {
    farcaster?: string;
    base?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
}

interface UserProfileProps {
    user: {
        _id: string;
        username: string;
        displayName?: string;
        bio?: string;
        profileImage?: string;
        followerCount?: number;
        followingCount?: number;
        socialLinks?: SocialLinks;
        walletAddress: string;
    };
    isOwner: boolean;
    isFollowing?: boolean;
    onFollow?: () => void;
    onUnfollow?: () => void;
    onEditProfile?: () => void;
}

export function UserProfileCard({
    user,
    isOwner,
    isFollowing = false,
    onFollow,
    onUnfollow,
    onEditProfile
}: UserProfileProps) {
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const handleFollowToggle = async () => {
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                await onUnfollow?.();
            } else {
                await onFollow?.();
            }
        } finally {
            setIsFollowLoading(false);
        }
    };

    return (
        <Card className="w-full bg-black/40 border-white/10 backdrop-blur-md mb-6">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary/50">
                            <AvatarImage src={user.profileImage} alt={user.username} />
                            <AvatarFallback className="bg-zinc-800 text-2xl">
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* User Info */}
                    <div className="flex-grow space-y-4 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {user.displayName || user.username}
                                </h2>
                                <p className="text-zinc-400">@{user.username}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                {isOwner ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onEditProfile}
                                        className="border-white/20 hover:bg-white/10"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isFollowing ? "secondary" : "default"}
                                        size="sm"
                                        onClick={handleFollowToggle}
                                        disabled={isFollowLoading}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus className="w-4 h-4 mr-2" />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="text-zinc-300 text-sm max-w-2xl">
                                {user.bio}
                            </p>
                        )}

                        {/* Stats & Socials */}
                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{user.followerCount || 0}</span>
                                    <span className="text-zinc-500">Followers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{user.followingCount || 0}</span>
                                    <span className="text-zinc-500">Following</span>
                                </div>
                            </div>

                            <div className="h-4 w-[1px] bg-zinc-700 hidden md:block" />

                            <div className="flex gap-3">
                                {user.socialLinks?.farcaster && (
                                    <a href={user.socialLinks.farcaster} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#8A63D2] transition-colors" title="Farcaster">
                                        <SiFarcaster className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.base && (
                                    <a href={user.socialLinks.base} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#0052FF] transition-colors" title="Base">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </a>
                                )}
                                {user.socialLinks?.x && (
                                    <a href={user.socialLinks.x} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                                        <FaTwitter className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.instagram && (
                                    <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#E1306C] transition-colors">
                                        <FaInstagram className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.facebook && (
                                    <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#1877F2] transition-colors">
                                        <FaFacebook className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.youtube && (
                                    <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#FF0000] transition-colors">
                                        <FaYoutube className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.tiktok && (
                                    <a href={user.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#00F2EA] transition-colors">
                                        <FaTiktok className="w-5 h-5" />
                                    </a>
                                )}
                                {user.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#0A66C2] transition-colors">
                                        <FaLinkedin className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
