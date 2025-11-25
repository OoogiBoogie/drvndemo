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
            name: "Farcaster Alpha",
            username: "base_casts",
            avatar: "https://github.com/shadcn.png",
            fid: 12345,
        },
        content:
            "Caught the DRVN GT3 warming tires at Willow Springs via the Base camera rig. Frame replay dropping tonight.",
        timestamp: "5h",
        likes: 18,
        comments: 1,
        recasts: 4,
        source: "farcaster",
        externalUrl: "https://warpcast.com/base_casts/0x1234",
    },
    {
        id: "4",
        author: {
            name: "Base Builder",
            username: "base_builder",
            avatar: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
            baseAddress: "0x1234...5678",
        },
        content:
            "The future of automotive ownership is onchain. Just registered my first RWA on @DRVN_VHCLS. Fractional car ownership is here.",
        timestamp: "6h",
        likes: 89,
        comments: 23,
        recasts: 31,
        source: "base",
        externalUrl: "https://base.org/social/0x5678",
    },
    {
        id: "5",
        author: {
            name: "Crypto Garage",
            username: "crypto_garage",
            avatar: "https://github.com/shadcn.png",
            xHandle: "@crypto_garage",
        },
        content:
            "Just discovered @DRVN_VHCLS - they're tokenizing real cars on Base. The GT3 RS sponsorship model is genius. This is how RWAs should work.",
        timestamp: "8h",
        likes: 156,
        comments: 42,
        recasts: 67,
        source: "x",
        externalUrl: "https://x.com/crypto_garage/status/1234567890",
    },
];
