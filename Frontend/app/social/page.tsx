"use client";

import { useMemo, useState } from "react";
import { ContentFeed } from "@/app/components/social/ContentFeed";
import { CreatePostButton } from "@/app/components/social/CreatePostButton";
import { CreatePostModal } from "@/app/components/modals/CreatePostModal";
import { HeroHeader } from "@/app/components/ui/hero-header";
import Image from "next/image";
import { Car, Sparkles, Trophy } from "lucide-react";
import { SocialPost } from "@/app/components/social/types";
import { MOCK_SOCIAL_POSTS } from "@/app/components/social/mockPosts";

export default function SocialFeedPage() {
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [feedPosts, setFeedPosts] = useState<SocialPost[]>(() => [...MOCK_SOCIAL_POSTS]);

    // Mock user data for demo
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
                logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png",
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

    const handlePostCreated = (post: SocialPost) => {
        setFeedPosts((prev) => [post, ...prev]);
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
                <HeroHeader
                    title="Social Feed"
                    subtitle="Share builds, shout out sponsors, and keep Base updated"
                    backgroundImage="/Cars/GarageV12.jpg"
                />

                <QuickComposerCard onCreate={handleCreatePost} />
                <SponsorSpotlightCard />

                <ContentFeed posts={feedPosts} />
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
            />
        </div>
    );
}

function QuickComposerCard({ onCreate }: { onCreate: () => void }) {
    return (
        <button
            onClick={onCreate}
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
            </div>
            <div>
                <p className="text-white font-semibold">Cast directly from DRVN</p>
                <p className="text-sm text-zinc-400">
                    Tag vehicles, sponsors, and auto-post to Base + Farcaster
                </p>
            </div>
        </button>
    );
}

function SponsorSpotlightCard() {
    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-black via-[#0b0b0b] to-[#050505] p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png"
                    alt="Red Bull Racing"
                    fill
                    className="object-contain"
                />
            </div>
            <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Sponsor Spotlight</p>
                <p className="text-white font-semibold">Red Bull Racing × Black Widow</p>
                <p className="text-sm text-zinc-400">
                    Slot #03 minted. Claim perks and upload your paddock content.
                </p>
                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Titanium Tier</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" /> GT3 RS Registry</span>
                </div>
            </div>
        </div>
    );
}
