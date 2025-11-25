"use client";

import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Heart, MessageCircle, Repeat, Share, Car, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SocialPost, SocialPlatform } from "./types";

interface PostCardProps {
    post: SocialPost;
}

const platformConfig: Record<SocialPost["source"], { icon: string; label: string; color: string }> = {
    "in-app": { icon: "🚗", label: "DRVN", color: "bg-primary/20 text-primary border-primary/40" },
    farcaster: { icon: "🟣", label: "Farcaster", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
    base: { icon: "🔵", label: "Base", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
    x: { icon: "✕", label: "X", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40" },
};

export function PostCard({ post }: PostCardProps) {
    const sourceConfig = platformConfig[post.source];

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-md mb-4">
            <CardContent className="p-4">
                <div className="flex gap-3">
                    <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-white">{post.author.name}</span>
                            <span className="text-zinc-500 text-sm">@{post.author.username}</span>
                            <span className="text-zinc-600 text-xs">• {post.timestamp}</span>
                            <Badge className={`text-[10px] flex items-center gap-1 ${sourceConfig.color}`}>
                                <span>{sourceConfig.icon}</span>
                                {sourceConfig.label}
                            </Badge>
                            {post.externalUrl && (
                                <a 
                                    href={post.externalUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-primary transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                        
                        {post.crossPostedTo && post.crossPostedTo.length > 0 && (
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-[10px] text-zinc-500">Also on:</span>
                                {post.crossPostedTo.map((platform) => {
                                    const config = platformConfig[platform];
                                    return (
                                        <span 
                                            key={platform}
                                            className="text-xs bg-zinc-800 rounded-full px-2 py-0.5"
                                        >
                                            {config.icon}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <p className="text-zinc-200 text-sm mb-3 whitespace-pre-wrap">
                            {post.content}
                        </p>

                        {post.vehicleTag && (
                            <Link
                                href={`/vehicles/${post.vehicleTag.id}`}
                                className="inline-flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-1 mb-3"
                            >
                                <Car className="w-3.5 h-3.5" />
                                Tagged: {post.vehicleTag.label}
                            </Link>
                        )}

                        {post.sponsorTag && (
                            <Link
                                href={post.sponsorTag.url || `/sponsors/${post.sponsorTag.id}`}
                                className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 mb-3"
                            >
                                {post.sponsorTag.logo ? (
                                    <Image
                                        src={post.sponsorTag.logo}
                                        alt={post.sponsorTag.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-xs font-bold">
                                        {post.sponsorTag.name.substring(0, 2)}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-yellow-400">Sponsor</p>
                                    <p className="text-sm text-white font-semibold">{post.sponsorTag.name}</p>
                                </div>
                            </Link>
                        )}

                        {post.image && (
                            <div className="rounded-lg overflow-hidden mb-3 border border-white/10">
                                <Image
                                    src={post.image}
                                    alt="Post content"
                                    width={500}
                                    height={300}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between text-zinc-500 mt-2">
                            <Button variant="ghost" size="sm" className="hover:text-white hover:bg-white/5 px-2 h-8">
                                <MessageCircle className="w-4 h-4 mr-1.5" />
                                <span className="text-xs">{post.comments}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:text-green-500 hover:bg-green-500/10 px-2 h-8">
                                <Repeat className="w-4 h-4 mr-1.5" />
                                <span className="text-xs">{post.recasts}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:text-red-500 hover:bg-red-500/10 px-2 h-8">
                                <Heart className="w-4 h-4 mr-1.5" />
                                <span className="text-xs">{post.likes}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10 px-2 h-8">
                                <Share className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
