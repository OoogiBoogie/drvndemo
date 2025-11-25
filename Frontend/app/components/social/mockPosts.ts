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
        image: "/Cars/Porsche911.jpg",
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
            logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png",
            url: "/sponsors/1",
        },
        source: "in-app",
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
            logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png",
            url: "/sponsors/1",
        },
        source: "in-app",
    },
    {
        id: "3",
        author: {
            name: "Farcaster Alpha",
            username: "base_casts",
            avatar: "https://github.com/shadcn.png",
        },
        content:
            "Caught the DRVN GT3 warming tires at Willow Springs via the Base camera rig. Frame replay dropping tonight.",
        timestamp: "5h",
        likes: 18,
        comments: 1,
        recasts: 4,
        source: "farcaster",
    },
];
