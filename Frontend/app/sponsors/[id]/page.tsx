"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SponsorProfile } from "@/app/components/sponsor/SponsorProfile";
import { ManageSponsorshipModal } from "@/app/components/modals/ManageSponsorshipModal";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SponsorDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [showManageModal, setShowManageModal] = useState(false);

    // Mock Data - Fetch based on `id`
    const [sponsor, setSponsor] = useState({
        tokenId: id,
        name: "Red Bull Racing",
        bio: "Gives You Wings. Official partner of the DRVN ecosystem.",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png",
        website: "https://redbull.com",
        twitter: "https://x.com/redbullracing",
        instagram: "https://instagram.com/redbullracing",
        photos: [
            "/Cars/Porsche911.jpg",
            "/Cars/GarageV12.jpg",
            "/Cars/R34Garage.jpg",
        ],
        vehicleId: "1",
        vehicleName: "Black Widow (GT3 RS)",
        tier: "Titanium",
        slotNumber: 3,
        mintedOn: "Mar 18, 2025",
        mintPrice: 150,
        openSeaUrl: "https://opensea.io/assets/base/0xsponsorship/" + id,
        promoLinks: [
            {
                label: "Team Store Drop",
                description: "Limited edition pit crew jacket",
                url: "https://redbullshop.com/drvn",
            },
            {
                label: "Base Onchaincast",
                description: "Weekly race telemetry via Frames",
                url: "https://warpcast.com/redbullracing",
            },
        ],
        metrics: [
            { label: "Impressions", value: "1.2M", hint: "+14% vs last week" },
            { label: "Clicks", value: "38K", hint: "Base + Farcaster" },
            { label: "Engagement", value: "6.4%", hint: "Benchmark +2.1%" },
        ],
    });

    const isOwner = true; // Mock ownership check

    const handleManage = () => {
        setShowManageModal(true);
    };

    const handleBrandingUpdate = (branding: {
        name?: string;
        logo?: string;
        bio?: string;
        website?: string;
        twitter?: string;
        instagram?: string;
        photos?: string[];
    }) => {
        setSponsor((prev) => ({
            ...prev,
            name: branding.name || prev.name,
            logo: branding.logo || prev.logo,
            bio: branding.bio ?? prev.bio,
            website: branding.website || prev.website,
            twitter: branding.twitter || prev.twitter,
            instagram: branding.instagram || prev.instagram,
            photos: branding.photos && branding.photos.length > 0 ? branding.photos : prev.photos,
        }));
    };

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            {/* Header / Back Button */}
            <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link href={`/vehicles/${sponsor.vehicleId}`}>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-white">Sponsor Details</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                <SponsorProfile
                    sponsor={sponsor}
                    isOwner={isOwner}
                    onManage={handleManage}
                />
            </div>

            <ManageSponsorshipModal
                isOpen={showManageModal}
                onClose={() => setShowManageModal(false)}
                sponsorshipId={id}
                currentBranding={{
                    name: sponsor.name,
                    logo: sponsor.logo,
                    bio: sponsor.bio,
                    website: sponsor.website,
                    twitter: sponsor.twitter,
                    instagram: sponsor.instagram,
                    photos: sponsor.photos,
                }}
                onBrandingUpdate={handleBrandingUpdate}
            />
        </div>
    );
}
