"use client";

import { useMemo, useState } from "react";
import { PostCard } from "./PostCard";
import { SocialPost, SocialPostSource } from "./types";
import { MOCK_SOCIAL_POSTS } from "./mockPosts";

type FeedFilterId = SocialPostSource | "all";

interface ContentFeedProps {
    vehicleId?: string;
    title?: string;
    posts?: SocialPost[];
    showAllFilters?: boolean;
}

const FILTERS: Array<{ id: FeedFilterId; label: string; icon?: string }> = [
    { id: "all", label: "All" },
    { id: "in-app", label: "DRVN", icon: "🚗" },
    { id: "farcaster", label: "Farcaster", icon: "🟣" },
    { id: "base", label: "Base", icon: "🔵" },
    { id: "x", label: "X", icon: "✕" },
];

export function ContentFeed({ vehicleId, title = "Latest Activity", posts, showAllFilters = true }: ContentFeedProps) {
    const [activeFilter, setActiveFilter] = useState<FeedFilterId>("all");

    const feedPosts = posts ?? MOCK_SOCIAL_POSTS;

    const counts = useMemo(() => {
        return feedPosts.reduce(
            (acc, post) => {
                acc[post.source] = (acc[post.source] || 0) + 1;
                acc.all += 1;
                return acc;
            },
            { "in-app": 0, farcaster: 0, base: 0, x: 0, all: 0 } as Record<FeedFilterId, number>,
        );
    }, [feedPosts]);

    const visibleFilters = showAllFilters ? FILTERS : FILTERS.filter(f => f.id === "all" || counts[f.id] > 0);

    const filteredPosts = feedPosts.filter((post) => {
        const matchesVehicle = vehicleId ? post.vehicleTag?.id === vehicleId : true;
        const matchesFilter = vehicleId
            ? true
            : activeFilter === "all" || post.source === activeFilter;
        return matchesVehicle && matchesFilter;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-xl font-bold text-white">{vehicleId ? "Vehicle Activity" : title}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        {vehicleId ? "Tagged posts only" : "Signal straight from Base"}
                    </p>
                </div>
                {!vehicleId && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {visibleFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border flex items-center gap-1.5 ${
                                    activeFilter === filter.id
                                        ? "bg-primary/20 text-primary border-primary/40"
                                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                                }`}
                            >
                                {filter.icon && <span>{filter.icon}</span>}
                                {filter.label}
                                <span className="text-[10px] text-white/60">
                                    {counts[filter.id]}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {filteredPosts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-zinc-400 text-sm">
                    No posts match this filter yet. Share a lap or sponsor shoutout to light up the feed.
                </div>
            ) : (
                filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
        </div>
    );
}
