import { SocialPost } from "./types";

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
    {
        id: "1",
        author: {
            name: "DRVN Pilot",
            username: "drvn_pilot",
            avatar: "https://github.com/shadcn.png",
        },
        content:
            "Black Widow is officially on-chain. Registry certificate minted, sponsorship grid live, and $GT3RS trading on Base. Who's ready to cop the next slot?",
        image: "/Cars/GtrHero1.jpg",
        timestamp: "2h",
        likes: 42,
        comments: 5,
        recasts: 12,
        vehicleTag: {
            id: "1",
            label: "Black Widow",
        },
        sponsorTag: {
            id: "rb-1",
            name: "Red Bull Racing",
            logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
            url: "/sponsors/1",
        },
        source: "in-app",
        crossPostedTo: ["farcaster", "base"],
    },
    {
        id: "2",
        author: {
            name: "BSTR Vault",
            username: "bstr_vault",
            avatar: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
        },
        content:
            "Slot #03 sold out in 42 minutes. Carbon tiers open next—set alerts in the DRVN app to avoid missing the drop.",
        timestamp: "3h",
        likes: 65,
        comments: 11,
        recasts: 7,
        sponsorTag: {
            id: "rb-1",
            name: "Red Bull Racing",
            logo: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
            url: "/sponsors/1",
        },
        source: "in-app",
        crossPostedTo: ["x"],
    },
    {
        id: "3",
        author: {
            name: "Track Day Enthusiast",
            username: "trackday_fan",
            avatar: "https://github.com/shadcn.png",
        },
        content:
            "Just witnessed the Black Widow hitting 180mph on the main straight. The sound of that flat-six is pure magic. This is why we tokenize passion.",
        image: "/Cars/NsxHero1.jpg",
        timestamp: "4h",
        likes: 28,
        comments: 8,
        recasts: 15,
        vehicleTag: {
            id: "1",
            label: "Black Widow",
        },
        source: "in-app",
        crossPostedTo: ["farcaster"],
    },
    {
        id: "4",
        author: {
            name: "Garage Kings",
            username: "garage_kings",
            avatar: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
        },
        content:
            "New sponsorship opportunity just dropped! The NSX Type S is opening Carbon tier slots. First come, first served. Link in bio.",
        timestamp: "5h",
        likes: 92,
        comments: 34,
        recasts: 41,
        vehicleTag: {
            id: "2",
            label: "Ghost",
        },
        source: "in-app",
        crossPostedTo: ["base", "x"],
    },
    {
        id: "5",
        author: {
            name: "RWA Pioneer",
            username: "rwa_pioneer",
            avatar: "https://github.com/shadcn.png",
        },
        content:
            "The future of automotive ownership is here. Just acquired my first fractional share in a GT3 RS through DRVN. Real cars, real ownership, on-chain transparency.",
        timestamp: "6h",
        likes: 156,
        comments: 42,
        recasts: 67,
        source: "in-app",
        crossPostedTo: ["farcaster", "base", "x"],
    },
];
