export type SocialPostSource = "in-app" | "farcaster";

export interface SocialAuthor {
    name: string;
    username: string;
    avatar: string;
}

export interface SocialVehicleTag {
    id: string;
    label: string;
}

export interface SocialSponsorTag {
    id: string;
    name: string;
    logo?: string;
    url?: string;
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
    source: SocialPostSource;
}
