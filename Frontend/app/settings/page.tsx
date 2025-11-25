import { Settings } from "../components/Settings";
import { HeroHeader } from "../components/ui/hero-header";

export default function SettingsPage() {
    // Mock current user for demo
    const mockCurrentUser = {
        _id: "demo-user-id",
        username: "drvn_enthusiast",
        displayName: "DRVN Enthusiast",
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                <HeroHeader
                    title="Settings"
                    subtitle="Customize your DRVN VHCLS experience"
                    backgroundImage="/Cars/shop-hero-1.jpg"
                />
                <Settings currentUser={mockCurrentUser} isAuthenticated={true} />
            </div>
        </div>
    );
}
