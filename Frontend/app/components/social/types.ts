export type SocialPostSource = "in-app" | "farcaster" | "base" | "x";
export type SocialPlatform = "farcaster" | "base" | "x";

export interface SocialAuthor {
    name: string;
    username: string;
    avatar: string;
    fid?: number;
    baseAddress?: string;
    xHandle?: string;
    isFollowing?: boolean;
}

export interface SocialVehicleTag {
    id: string;
    label: string;
    ticker?: string;
}

export interface SocialSponsorTag {
    id: string;
    name: string;
    logo?: string;
    url?: string;
}

export interface SocialSponsorsInfo {
    sponsors: Array<{ id: string; name: string; logo?: string; url?: string }>;
    availableSlots: number;
    vehicleId: string;
}

export interface SocialPost {
    id: string;
    author: SocialAuthor;
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    comments: number;
    recasts: number;
    vehicleTag?: SocialVehicleTag;
    sponsorTag?: SocialSponsorTag;
    sponsorsInfo?: SocialSponsorsInfo;
    source: SocialPostSource;
    crossPostedTo?: SocialPlatform[];
    externalUrl?: string;
}

export interface PlatformConnection {
    platform: SocialPlatform;
    connected: boolean;
    username?: string;
    avatar?: string;
    fid?: number;
}

export interface CrossPostSettings {
    farcaster: boolean;
    base: boolean;
    x: boolean;
}
