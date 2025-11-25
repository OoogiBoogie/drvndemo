"use client";

import { useCallback, useMemo, useState } from "react";
import type { VehicleStatusItem } from "@/app/components/vehicle/VehicleStatusChecklist";

export interface VehicleRegistryMeta {
    vin: string;
    plate?: string;
    location?: string;
    garage?: string;
    mintedOn?: string;
    lastService?: string;
}

export interface VehicleFactorySpecs {
    year: number;
    make: string;
    model: string;
    engine?: string;
}

export interface VehicleSponsor {
    tokenId: string;
    name?: string;
    holderAddress: string;
    logo?: string;
}

export interface VehicleCarTokenMeta {
    ticker: string;
    price?: number;
    mcap?: number;
    change24h?: number;
    address?: string;
}

export interface SponsorshipCollectionMeta {
    contractAddress: string;
    maxSupply: number;
    mintPrice: number;
    mintedCount?: number;
}

export interface VehicleRegistrationResult {
    vehicleId: string;
    registryId?: string;
    vin: string;
    factorySpecs: VehicleFactorySpecs;
    nickname?: string;
    tokenId: number;
    tbaAddress: string;
    images: string[];
    mintedOn?: string;
    registryMeta?: Partial<VehicleRegistryMeta>;
}

export interface VehicleUpgradeResult {
    tierId: string;
    carToken: VehicleCarTokenMeta;
    sponsorshipCollection: SponsorshipCollectionMeta;
}

export interface SponsorshipPurchaseResult {
    tokenId: number;
    sponsor: VehicleSponsor;
}

interface VehicleLifecycleOptions {
    vehicleId: string;
    initialStatus?: VehicleStatusItem[];
    initialRegistry?: VehicleRegistryMeta;
    initialCarToken?: VehicleCarTokenMeta | null;
    initialSponsorshipCollection?: SponsorshipCollectionMeta | null;
    initialSponsors?: VehicleSponsor[];
}

const DEFAULT_STATUS: VehicleStatusItem[] = [
    {
        id: "registry",
        label: "Base Registry",
        description: "VIN decoded, certificate minted on Base",
        state: "pending",
    },
    {
        id: "monetized",
        label: "Car Token",
        description: "Car token and sponsorship wrapper deployed",
        state: "pending",
    },
    {
        id: "sponsorship",
        label: "Sponsor Grid",
        description: "14-slot NFT collection ready for brands",
        state: "pending",
    },
];

export function useVehicleLifecycle({
    vehicleId,
    initialStatus,
    initialRegistry,
    initialCarToken = null,
    initialSponsorshipCollection = null,
    initialSponsors = [],
}: VehicleLifecycleOptions) {
    const [statusPipeline, setStatusPipeline] = useState<VehicleStatusItem[]>(
        initialStatus && initialStatus.length > 0 ? initialStatus : DEFAULT_STATUS,
    );
    const [registryDetails, setRegistryDetails] = useState<VehicleRegistryMeta | null>(initialRegistry || null);
    const [carToken, setCarToken] = useState<VehicleCarTokenMeta | null>(initialCarToken);
    const [sponsorshipCollection, setSponsorshipCollection] = useState<SponsorshipCollectionMeta | null>(
        initialSponsorshipCollection,
    );
    const [sponsors, setSponsors] = useState<VehicleSponsor[]>(initialSponsors);

    const updateStage = useCallback((stageId: string, patch: Partial<VehicleStatusItem>) => {
        setStatusPipeline((prev) => {
            const exists = prev.find((stage) => stage.id === stageId);
            if (!exists) {
                return [...prev, { id: stageId, label: stageId, description: "", state: "pending", ...patch }];
            }
            return prev.map((stage) => (stage.id === stageId ? { ...stage, ...patch } : stage));
        });
    }, []);

    const handleRegistrationComplete = useCallback(
        (payload: VehicleRegistrationResult) => {
            setRegistryDetails({
                vin: payload.vin,
                mintedOn: payload.mintedOn || new Date().toISOString(),
                garage: payload.registryMeta?.garage ?? initialRegistry?.garage,
                location: payload.registryMeta?.location ?? initialRegistry?.location,
                plate: payload.registryMeta?.plate ?? initialRegistry?.plate,
                lastService: payload.registryMeta?.lastService ?? initialRegistry?.lastService,
            });

            updateStage("registry", { state: "complete" });
            updateStage("monetized", { state: carToken ? "complete" : "active" });
        },
        [carToken, initialRegistry, updateStage],
    );

    const handleUpgradeComplete = useCallback(
        (payload: VehicleUpgradeResult) => {
            setCarToken(payload.carToken);
            setSponsorshipCollection(payload.sponsorshipCollection);

            updateStage("registry", { state: "complete" });
            updateStage("monetized", { state: "complete" });
            updateStage("sponsorship", { state: "active" });
        },
        [updateStage],
    );

    const handleSponsorshipMint = useCallback(
        (payload: SponsorshipPurchaseResult) => {
            setSponsors((prev) => {
                const exists = prev.find((sponsor) => sponsor.tokenId === payload.sponsor.tokenId);
                if (exists) {
                    return prev.map((sponsor) => (sponsor.tokenId === payload.sponsor.tokenId ? payload.sponsor : sponsor));
                }
                return [...prev, payload.sponsor];
            });

            setSponsorshipCollection((prev) => {
                if (!prev) return prev;
                const mintedCount = Math.min(prev.maxSupply, (prev.mintedCount || 0) + 1);
                const nextCollection = { ...prev, mintedCount };
                if (mintedCount >= prev.maxSupply) {
                    updateStage("sponsorship", { state: "complete" });
                }
                return nextCollection;
            });
        },
        [updateStage],
    );

    const lifecycleState = useMemo(
        () => ({
            vehicleId,
            statusPipeline,
            registryDetails,
            carToken,
            sponsorshipCollection,
            sponsors,
        }),
        [vehicleId, statusPipeline, registryDetails, carToken, sponsorshipCollection, sponsors],
    );

    return {
        ...lifecycleState,
        handleRegistrationComplete,
        handleUpgradeComplete,
        handleSponsorshipMint,
        setSponsors,
        setSponsorshipCollection,
    };
}
