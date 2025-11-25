import { Garage } from "../components/Garage";

export default function GaragePage() {
    // Mock current user for demo
    const mockCurrentUser = {
        _id: "demo-user-id",
        username: "drvn_enthusiast",
        displayName: "DRVN Enthusiast",
        bio: "Passionate about cars and Web3 🏎️",
        profileImage: "https://github.com/shadcn.png",
        walletAddress: "0x0000000000000000000000000000000000000000",
        socialLinks: {
            base: "base.org/drvn",
            x: "@drvn_platform",
            instagram: "@drvn",
        },
        followerCount: 1234,
        followingCount: 567,
    };

    return <Garage currentUser={mockCurrentUser} isAuthenticated={true} />;
}
