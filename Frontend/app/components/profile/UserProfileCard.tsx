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
import { SiFarcaster } from "react-icons/si";
import { Edit, UserPlus, UserMinus, ExternalLink } from "lucide-react";
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

interface VehicleToken {
    ticker: string;
    address?: string;
    vehicleName?: string;
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
        farcasterHandle?: string;
        baseHandle?: string;
    };
    isOwner: boolean;
    isFollowing?: boolean;
    vehicleTokens?: VehicleToken[];
    onFollow?: () => void;
    onUnfollow?: () => void;
    onEditProfile?: () => void;
    onTokenClick?: (token: VehicleToken) => void;
}

function parseLinksInBio(bio: string): React.ReactNode[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = bio.split(urlRegex);
    
    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            urlRegex.lastIndex = 0;
            const displayUrl = part.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00daa2] hover:text-[#00b894] hover:underline inline-flex items-center gap-0.5"
                >
                    {displayUrl.length > 30 ? displayUrl.substring(0, 30) + '...' : displayUrl}
                    <ExternalLink className="w-3 h-3" />
                </a>
            );
        }
        return <span key={index}>{part}</span>;
    });
}

export function UserProfileCard({
    user,
    isOwner,
    isFollowing = false,
    vehicleTokens = [],
    onFollow,
    onUnfollow,
    onEditProfile,
    onTokenClick
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
        <Card className="w-full max-w-full bg-black/40 border-white/10 backdrop-blur-md mb-6 overflow-hidden box-border">
            <CardContent className="p-3 md:p-6 overflow-hidden w-full max-w-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-full">
                    {/* LEFT COLUMN: PFP, username, handles, followers */}
                    <div className="flex flex-row md:flex-col gap-4 md:gap-3 items-center md:items-start flex-shrink-0">
                        {/* Profile Image */}
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-primary/50">
                            <AvatarImage src={user.profileImage} alt={user.username} />
                            <AvatarFallback className="bg-zinc-800 text-xl">
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Identity - Mobile: beside PFP, Desktop: below PFP */}
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                                {user.displayName || user.username}
                            </h2>
                            <p className="text-zinc-400 text-sm">@{user.username}</p>
                            
                            {/* Farcaster/Base Handles */}
                            <div className="flex flex-wrap gap-2 text-xs mt-1">
                                {user.farcasterHandle && (
                                    <a 
                                        href={`https://warpcast.com/${user.farcasterHandle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[#8A63D2] hover:text-[#a07de8]"
                                    >
                                        <SiFarcaster className="w-3 h-3" />
                                        <span>@{user.farcasterHandle}</span>
                                    </a>
                                )}
                                {user.baseHandle && (
                                    <a 
                                        href={`https://base.org/${user.baseHandle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[#0052FF] hover:text-[#3373ff]"
                                    >
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                        <span>@{user.baseHandle}</span>
                                    </a>
                                )}
                            </div>

                            {/* Followers/Following */}
                            <div className="flex gap-3 text-sm mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{user.followerCount || 0}</span>
                                    <span className="text-zinc-500">Followers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{user.followingCount || 0}</span>
                                    <span className="text-zinc-500">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Social icons + Follow, Bio, Token tickers */}
                    <div className="flex-grow space-y-3 min-w-0 overflow-hidden">
                        {/* Row 1: Social Icons + Follow/Edit Button */}
                        <div className="flex items-center justify-between gap-3">
                            {/* Social Links */}
                            <div className="flex gap-2 flex-wrap">
                                {user.socialLinks?.farcaster && (
                                    <a href={user.socialLinks.farcaster} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#8A63D2] hover:border-[#8A63D2]/50 hover:shadow-[0_0_12px_rgba(138,99,210,0.3)] transition-all" title="Farcaster">
                                        <SiFarcaster className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.base && (
                                    <a href={user.socialLinks.base} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#0052FF] hover:border-[#0052FF]/50 hover:shadow-[0_0_12px_rgba(0,82,255,0.3)] transition-all" title="Base">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </a>
                                )}
                                {user.socialLinks?.x && (
                                    <a href={user.socialLinks.x} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-white hover:border-white/50 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-all" title="X/Twitter">
                                        <FaTwitter className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.instagram && (
                                    <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#E1306C] hover:border-[#E1306C]/50 hover:shadow-[0_0_12px_rgba(225,48,108,0.3)] transition-all" title="Instagram">
                                        <FaInstagram className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.facebook && (
                                    <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#1877F2] hover:border-[#1877F2]/50 hover:shadow-[0_0_12px_rgba(24,119,242,0.3)] transition-all" title="Facebook">
                                        <FaFacebook className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.youtube && (
                                    <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#FF0000] hover:border-[#FF0000]/50 hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all" title="YouTube">
                                        <FaYoutube className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.tiktok && (
                                    <a href={user.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#00F2EA] hover:border-[#00F2EA]/50 hover:shadow-[0_0_12px_rgba(0,242,234,0.3)] transition-all" title="TikTok">
                                        <FaTiktok className="w-4 h-4" />
                                    </a>
                                )}
                                {user.socialLinks?.linkedin && (
                                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 text-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.1)] hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:shadow-[0_0_12px_rgba(10,102,194,0.3)] transition-all" title="LinkedIn">
                                        <FaLinkedin className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            {/* Follow/Edit Button */}
                            <div className="flex-shrink-0">
                                {isOwner ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onEditProfile}
                                        className="border-white/20 hover:bg-white/10"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isFollowing ? "secondary" : "default"}
                                        size="sm"
                                        onClick={handleFollowToggle}
                                        disabled={isFollowLoading}
                                        className={isFollowing ? "" : "bg-[#00daa2] hover:bg-[#00b894] text-black"}
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus className="w-4 h-4 mr-1" />
                                                Unfollow
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4 mr-1" />
                                                Follow
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Bio with clickable links */}
                        {user.bio && (
                            <p className="text-zinc-300 text-sm leading-relaxed break-words overflow-hidden">
                                {parseLinksInBio(user.bio)}
                            </p>
                        )}

                        {/* Row 3: Token Ticker Quick Links */}
                        {vehicleTokens.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="text-xs text-zinc-500 mr-1">Tokens:</span>
                                {vehicleTokens.map((token) => (
                                    <button
                                        key={token.ticker}
                                        onClick={() => onTokenClick?.(token)}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 hover:border-primary/40 transition-colors"
                                        title={token.vehicleName || `View ${token.ticker}`}
                                    >
                                        ${token.ticker}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
