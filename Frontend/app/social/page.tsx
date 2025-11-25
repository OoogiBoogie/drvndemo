"use client";

import { useMemo, useState } from "react";
import { ContentFeed } from "@/app/components/social/ContentFeed";
import { CreatePostButton } from "@/app/components/social/CreatePostButton";
import { CreatePostModal } from "@/app/components/modals/CreatePostModal";
import { HeroHeader } from "@/app/components/ui/hero-header";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { 
    Car, 
    Sparkles, 
    Trophy, 
    ExternalLink, 
    Check, 
    Plus,
    Zap,
    Users,
    Globe,
    Shield
} from "lucide-react";
import { SocialPost, PlatformConnection, CrossPostSettings } from "@/app/components/social/types";
import { MOCK_SOCIAL_POSTS } from "@/app/components/social/mockPosts";

export default function SocialFeedPage() {
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() => [...MOCK_SOCIAL_POSTS]);
    
    const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([
        { platform: "farcaster", connected: false },
        { platform: "base", connected: true, username: "0x1234...5678" },
        { platform: "x", connected: false },
    ]);

    const [crossPostSettings, setCrossPostSettings] = useState<CrossPostSettings>({
        farcaster: false,
        base: true,
        x: false,
    });

    const mockUserId = "demo-user-id";
    const mockUser = {
        id: mockUserId,
        name: "Ava Accelerator",
        username: "ava_drvn",
        avatar: "https://i.pravatar.cc/150?img=11",
    };

    const mockRegisteredVehicles = [
        {
            id: "1",
            nickname: "Black Widow",
            make: "Porsche",
            model: "911 GT3 RS",
        },
    ];

    const availableSponsors = useMemo(
        () => [
            {
                id: "rb-1",
                name: "Red Bull Racing",
                logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
                url: "/sponsors/1",
            },
            {
                id: "base-cameras",
                name: "Base Cameras",
                logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
                url: "https://base.org",
            },
        ],
        [],
    );

    const handleCreatePost = () => {
        setShowCreatePostModal(true);
    };

    const handlePostCreated = (post: SocialPost, settings: CrossPostSettings) => {
        setCrossPostSettings(settings);
        setFeedPosts((prev) => [post, ...prev]);
    };

    const handleConnectPlatform = (platform: "farcaster" | "base" | "x") => {
        setPlatformConnections(prev => 
            prev.map(p => 
                p.platform === platform 
                    ? { ...p, connected: true, username: platform === "farcaster" ? "@drvn_user" : platform === "x" ? "@drvn_vhcls" : "0xABC...123" }
                    : p
            )
        );
        setCrossPostSettings(prev => ({ ...prev, [platform]: true }));
    };

    const connectedCount = platformConnections.filter(p => p.connected).length;

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
                <HeroHeader
                    title="Social Hub"
                    subtitle="Share builds across Farcaster, Base & X from one place"
                    backgroundImage="/Cars/GarageV12.jpg"
                />

                <PlatformConnectionsCard 
                    connections={platformConnections}
                    onConnect={handleConnectPlatform}
                />

                <QuickComposerCard 
                    onCreate={handleCreatePost} 
                    connectedPlatforms={platformConnections.filter(p => p.connected)}
                    crossPostSettings={crossPostSettings}
                    onTogglePlatform={(platform) => {
                        setCrossPostSettings(prev => ({
                            ...prev,
                            [platform]: !prev[platform]
                        }));
                    }}
                />

                <StatsCard connectedCount={connectedCount} postCount={feedPosts.length} />

                <SponsorSpotlightCard />

                <ContentFeed posts={feedPosts} showAllFilters={true} />
            </div>

            <CreatePostButton onClick={handleCreatePost} />

            <CreatePostModal
                isOpen={showCreatePostModal}
                onClose={() => setShowCreatePostModal(false)}
                userId={mockUserId}
                registeredVehicles={mockRegisteredVehicles}
                currentUser={{
                    name: mockUser.name,
                    username: mockUser.username,
                    avatar: mockUser.avatar,
                }}
                sponsors={availableSponsors}
                onPostCreated={handlePostCreated}
                connectedPlatforms={platformConnections.filter(p => p.connected).map(p => p.platform)}
                initialCrossPostSettings={crossPostSettings}
            />
        </div>
    );
}

function PlatformConnectionsCard({ 
    connections, 
    onConnect 
}: { 
    connections: PlatformConnection[];
    onConnect: (platform: "farcaster" | "base" | "x") => void;
}) {
    const platformInfo = {
        farcaster: {
            name: "Farcaster",
            icon: "🟣",
            color: "purple",
            description: "Cast to the decentralized social network",
            benefits: ["Reach Farcaster community", "Earn channel rewards", "Build reputation"],
        },
        base: {
            name: "Base",
            icon: "🔵",
            color: "blue",
            description: "Native onchain social on Base",
            benefits: ["Onchain attestations", "Mini app integration", "Base ecosystem"],
        },
        x: {
            name: "X (Twitter)",
            icon: "✕",
            color: "gray",
            description: "Cross-post to your X audience",
            benefits: ["Wider reach", "Build following", "Drive traffic"],
        },
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-white font-bold">Connected Platforms</h3>
                    <p className="text-xs text-zinc-400">Link your accounts to cross-post everywhere</p>
                </div>
            </div>

            <div className="grid gap-3">
                {connections.map((conn) => {
                    const info = platformInfo[conn.platform];
                    return (
                        <div 
                            key={conn.platform}
                            className={`rounded-xl border p-4 transition-all ${
                                conn.connected 
                                    ? "border-primary/30 bg-primary/5" 
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{info.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-semibold">{info.name}</span>
                                            {conn.connected && (
                                                <span className="flex items-center gap-1 text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                                                    <Check className="w-3 h-3" /> Connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            {conn.connected ? conn.username : info.description}
                                        </p>
                                    </div>
                                </div>
                                
                                {conn.connected ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => onConnect(conn.platform)}
                                        className="bg-white/10 hover:bg-white/20 text-white border-0"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Connect
                                    </Button>
                                )}
                            </div>
                            
                            {!conn.connected && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {info.benefits.map((benefit, i) => (
                                        <span 
                                            key={i}
                                            className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full"
                                        >
                                            {benefit}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function QuickComposerCard({ 
    onCreate,
    connectedPlatforms,
    crossPostSettings,
    onTogglePlatform,
}: { 
    onCreate: () => void;
    connectedPlatforms: PlatformConnection[];
    crossPostSettings: CrossPostSettings;
    onTogglePlatform: (platform: "farcaster" | "base" | "x") => void;
}) {
    const platformIcons = {
        farcaster: "🟣",
        base: "🔵",
        x: "✕",
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <button
                onClick={onCreate}
                className="w-full flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
            >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-white font-semibold">Create a Post</p>
                    <p className="text-sm text-zinc-400">
                        Tag vehicles, mention sponsors, share everywhere
                    </p>
                </div>
                <Zap className="w-5 h-5 text-primary" />
            </button>

            {connectedPlatforms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-zinc-500 mb-2">Cross-post to:</p>
                    <div className="flex flex-wrap gap-2">
                        {connectedPlatforms.map((platform) => (
                            <button
                                key={platform.platform}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePlatform(platform.platform);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    crossPostSettings[platform.platform]
                                        ? "bg-primary/20 text-primary border border-primary/40"
                                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                                }`}
                            >
                                <span>{platformIcons[platform.platform]}</span>
                                <span className="capitalize">{platform.platform}</span>
                                {crossPostSettings[platform.platform] && (
                                    <Check className="w-3 h-3" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsCard({ connectedCount, postCount }: { connectedCount: number; postCount: number }) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 text-center">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{connectedCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Platforms</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4 text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">{postCount}</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Posts</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 text-center">
                <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold text-white">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">On-chain</p>
            </div>
        </div>
    );
}

function SponsorSpotlightCard() {
    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-black via-[#0b0b0b] to-[#050505] p-4 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Image
                    src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4"
                    alt="Sponsor"
                    width={40}
                    height={40}
                    className="rounded-lg"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Sponsor Spotlight</p>
                <p className="text-white font-semibold truncate">Red Bull Racing × Black Widow</p>
                <p className="text-sm text-zinc-400 truncate">
                    Slot #03 minted. Claim perks and upload content.
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Titanium</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" /> GT3 RS</span>
                </div>
            </div>
        </div>
    );
}
