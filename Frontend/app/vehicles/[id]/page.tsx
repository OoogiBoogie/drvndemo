"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SwipeableGallery } from "@/app/components/vehicle/SwipeableGallery";
import { CarProfileCard } from "@/app/components/vehicle/CarProfileCard";
import { SponsorshipModule } from "@/app/components/vehicle/SponsorshipModule";
import { TokenDetails } from "@/app/components/vehicle/TokenDetails";
import { VehicleStatusChecklist } from "@/app/components/vehicle/VehicleStatusChecklist";
import { VehicleStatGrid } from "@/app/components/vehicle/VehicleStatGrid";
import { ContentFeed } from "@/app/components/social/ContentFeed";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Share2, MapPin, Fingerprint, Gauge, Timer, Fuel, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { UpgradeVehicleModal } from "@/app/components/modals/UpgradeVehicleModal";
import { BuySponsorshipModal } from "@/app/components/modals/BuySponsorshipModal";
import { useVehicleLifecycle } from "@/hooks/useVehicleLifecycle";

export default function RegisteredVehiclePage() {
    const params = useParams();
    const id = params.id as string;

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showBuySponsorModal, setShowBuySponsorModal] = useState(false);

    // Mock Data - In real app, fetch this based on `id`
    const initialVehicle = {
        id: id,
        nickname: "Black Widow",
        make: "Porsche",
        model: "911 GT3 RS",
        year: 2024,
        nftImage: "/Cars/Porsche911.jpg",
        isUpgraded: true,
        location: "Los Angeles, CA",
        registryId: "DRV-143",
        owner: {
            name: "Avery Nakamura",
            username: "avery911",
            avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=256&h=256&q=80"
        },
        followerCount: 1843,
        images: [
            { url: "/Cars/Porsche911.jpg", isNftImage: true },
            { url: "/Cars/GarageV12.jpg", isNftImage: false },
            { url: "/Cars/R34Garage.jpg", isNftImage: false },
        ],
        carToken: {
            ticker: "GT3RS",
            price: 0.000045,
            mcap: 450000,
            change24h: 12.5,
            address: "0x1234567890abcdef1234567890abcdef12345678",
        },
        sponsorshipCollection: {
            contractAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
            maxSupply: 14,
            mintedCount: 4,
            mintPrice: 100,
        },
        registry: {
            vin: "WP0AF2A95RS123456",
            plate: "BSTR911",
            location: "Los Angeles, CA",
            garage: "BSTR Motors HQ",
            mintedOn: "Mar 4, 2024",
            lastService: "Mar 2, 2024",
        },
        performance: {
            horsepower: 518,
            zeroToSixty: "3.0s",
            topSpeed: "198 mph",
            mileage: "2,400 mi",
            trackMode: "Willow Springs",
        },
        market: {
            sponsorFloor: "$1,250",
            royaltySplit: "50% secondary",
            tokenHolders: "812 wallets",
            vaultYield: "6.2% APY",
        },
        statusPipeline: [
            {
                id: "registry",
                label: "Base Registry Minted",
                description: "VIN decoded, metadata stored, and certificate issued on Base",
                state: "complete" as const,
            },
            {
                id: "monetized",
                label: "Car Token Live",
                description: "$GT3RS trading with liquidity on-chain and swap support",
                state: "complete" as const,
            },
            {
                id: "sponsorship",
                label: "Sponsor Grid",
                description: "14-slot NFT collection ready for brand activations",
                state: "active" as const,
            },
        ],
        sponsors: [
            {
                tokenId: "1",
                name: "Red Bull Racing",
                holderAddress: "0x1111111111111111111111111111111111111111",
                logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Red_Bull_Racing_logo.svg/1200px-Red_Bull_Racing_logo.svg.png"
            },
            {
                tokenId: "2",
                name: "Michelin",
                holderAddress: "0x2222222222222222222222222222222222222222",
                logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Michelin_logo.svg/1200px-Michelin_logo.svg.png"
            },
            {
                tokenId: "3",
                name: "Brembo",
                holderAddress: "0x3333333333333333333333333333333333333333",
            },
            {
                tokenId: "4",
                name: "Mobil 1",
                holderAddress: "0x4444444444444444444444444444444444444444",
            },
        ],
    };

    const [vehicle, setVehicle] = useState(initialVehicle);

    const lifecycle = useVehicleLifecycle({
        vehicleId: vehicle.id,
        initialStatus: vehicle.statusPipeline,
        initialRegistry: vehicle.registry,
        initialCarToken: vehicle.carToken,
        initialSponsorshipCollection: vehicle.sponsorshipCollection,
        initialSponsors: vehicle.sponsors,
    });

    const handleUpgrade = () => {
        setShowUpgradeModal(true);
    };

    const handleUpgradeComplete = (payload: Parameters<typeof lifecycle.handleUpgradeComplete>[0]) => {
        setVehicle((prev) => ({
            ...prev,
            isUpgraded: true,
            carToken: {
                ...prev.carToken,
                ...payload.carToken,
            },
            sponsorshipCollection: payload.sponsorshipCollection,
        }));
        lifecycle.handleUpgradeComplete(payload);
    };

    const handleSponsorClick = () => {
        setShowBuySponsorModal(true);
    };

    const handleSponsorPurchase = (payload: Parameters<typeof lifecycle.handleSponsorshipMint>[0]) => {
        setVehicle((prev) => {
            const existingIndex = prev.sponsors.findIndex((s) => s.tokenId === payload.sponsor.tokenId);
            const isNewSponsor = existingIndex === -1;
            const nextSponsors = isNewSponsor
                ? [...prev.sponsors, payload.sponsor]
                : prev.sponsors.map((s, idx) => (idx === existingIndex ? payload.sponsor : s));
            const existingCollection = prev.sponsorshipCollection;
            const updatedCollection = existingCollection
                ? {
                    ...existingCollection,
                    mintedCount: Math.min(
                        existingCollection.maxSupply,
                        (existingCollection.mintedCount || 0) + (isNewSponsor ? 1 : 0),
                    ),
                }
                : existingCollection;
            return {
                ...prev,
                sponsors: nextSponsors,
                sponsorshipCollection: updatedCollection,
            };
        });
        lifecycle.handleSponsorshipMint(payload);
    };

    const activeCollection = lifecycle.sponsorshipCollection || vehicle.sponsorshipCollection;
    const mintedSlots = activeCollection?.mintedCount ?? lifecycle.sponsors.length ?? vehicle.sponsors.length;
    const availableSponsorSlots = activeCollection
        ? Math.max(0, activeCollection.maxSupply - mintedSlots)
        : 0;
    const activeMintPrice = activeCollection?.mintPrice ?? vehicle.sponsorshipCollection?.mintPrice ?? 100;

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            {/* Header / Back Button */}
            <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="max-w-md mx-auto flex items-center justify-between gap-2">
                    <Link href="/garage">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="flex-1 text-center">
                        <h1 className="text-lg font-bold text-white">Vehicle Details</h1>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Registry & Monetization</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* 1. Swipeable Gallery */}
                <SwipeableGallery images={vehicle.images} />

                {/* Vehicle Snapshot */}
                <VehicleStatGrid
                    title="Registry Snapshot"
                    stats={[
                        { label: "Garage", value: vehicle.registry.garage, hint: vehicle.registry.location, icon: <MapPin className="w-4 h-4 text-primary" /> },
                        { label: "VIN", value: vehicle.registry.vin, hint: "On-chain attested", icon: <Fingerprint className="w-4 h-4 text-zinc-300" /> },
                        { label: "Plate", value: vehicle.registry.plate, icon: <ShieldCheck className="w-4 h-4 text-primary" /> },
                        { label: "Minted", value: vehicle.registry.mintedOn, hint: "via DRVN Registry", icon: <Timer className="w-4 h-4 text-zinc-300" /> },
                    ]}
                />

                {/* 2. Car Profile Card */}
                <CarProfileCard vehicle={vehicle} onUpgrade={handleUpgrade} />

                <VehicleStatusChecklist items={lifecycle.statusPipeline} />

                <VehicleStatGrid
                    title="Performance Notes"
                    stats={[
                        { label: "Horsepower", value: `${vehicle.performance.horsepower} hp`, icon: <Gauge className="w-4 h-4 text-white/70" /> },
                        { label: "0-60", value: vehicle.performance.zeroToSixty, hint: "Track mode", icon: <Timer className="w-4 h-4 text-white/70" /> },
                        { label: "Top Speed", value: vehicle.performance.topSpeed, icon: <Fuel className="w-4 h-4 text-white/70" /> },
                        { label: "Mileage", value: vehicle.performance.mileage, hint: vehicle.performance.trackMode, icon: <MapPin className="w-4 h-4 text-white/70" /> },
                    ]}
                />

                {vehicle.isUpgraded && (
                    <VehicleStatGrid
                        title="Monetization Metrics"
                        stats={[
                            { label: "Sponsor Floor", value: vehicle.market.sponsorFloor },
                            { label: "Royalty Split", value: vehicle.market.royaltySplit },
                            { label: "Token Holders", value: vehicle.market.tokenHolders, icon: <Users className="w-4 h-4 text-white/70" /> },
                            { label: "Vault Yield", value: vehicle.market.vaultYield },
                        ]}
                    />
                )}

                {/* 3. Sponsorship Module (If Upgraded) */}
                {vehicle.isUpgraded && (
                    <SponsorshipModule
                        vehicleName={vehicle.nickname || vehicle.model}
                        sponsorshipCollection={lifecycle.sponsorshipCollection || vehicle.sponsorshipCollection}
                        sponsors={lifecycle.sponsors}
                        onSponsorClick={handleSponsorClick}
                    />
                )}

                {/* 4. Token Details (If Upgraded) */}
                {vehicle.isUpgraded && (lifecycle.carToken || vehicle.carToken) && (
                    <TokenDetails token={(lifecycle.carToken || vehicle.carToken)!} />
                )}

                {/* 5. Filtered Content Feed */}
                <ContentFeed vehicleId={id} />
            </div>

            {/* Modals */}
            <UpgradeVehicleModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                vehicleId={vehicle.id}
                vehicleName={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                onUpgradeComplete={handleUpgradeComplete}
            />

            <BuySponsorshipModal
                isOpen={showBuySponsorModal}
                onClose={() => setShowBuySponsorModal(false)}
                vehicleId={vehicle.id}
                vehicleName={vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                vehicleImage={vehicle.nftImage}
                mintPrice={activeMintPrice}
                availableSlots={availableSponsorSlots}
                onPurchaseSuccess={handleSponsorPurchase}
            />
        </div>
    );
}
