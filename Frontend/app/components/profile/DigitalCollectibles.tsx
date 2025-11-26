"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Key, ExternalLink, Settings, Trophy } from "lucide-react";
import Image from "next/image";
import deployedContracts from "@/contracts/deployedContracts";
import { vehicles, Sponsor } from "@/app/data/vehicleData";
import { SponsorProfileEditorModal } from "@/app/components/modals/SponsorProfileEditorModal";

// Type for the reward config tuple returned by the contract
type RewardConfig = [
    string, // bstr
    string, // vault
    boolean, // isContract
    bigint, // perUnit
    boolean, // enabled
    boolean, // onAirdrop
    boolean, // strict
];

interface DigitalCollectiblesProps {
    profileAddress?: string; // Optional: for viewing other users' profiles
    isOwner?: boolean; // Whether the current viewer owns this profile
}

export function DigitalCollectibles({ profileAddress, isOwner = true }: DigitalCollectiblesProps) {
    const { address: connectedAddress } = useAccount();
    const [selectedSponsor, setSelectedSponsor] = useState<{ sponsor: Sponsor; vehicleName: string } | null>(null);
    
    // For public profile viewing, use the profile's address
    // Only fall back to connected wallet if this is the owner's view (no profileAddress specified)
    // This ensures we show the correct user's NFTs, not the viewer's
    const address = profileAddress || (isOwner ? connectedAddress : undefined);

    // Find all sponsorship NFTs owned by this address
    const ownedSponsorships = vehicles.flatMap(vehicle => {
        if (!vehicle.sponsors || !address) return [];
        return vehicle.sponsors
            .filter(sponsor => sponsor.holderAddress.toLowerCase() === address.toLowerCase())
            .map(sponsor => ({
                sponsor,
                vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                vehicleImage: vehicle.images?.[0]?.url || "/Cars/placeholder.jpg"
            }));
    });

    // Contract addresses for the three collections
    const steelConfig = deployedContracts[8453].SteelBuster;
    const carbonConfig = deployedContracts[8453].CarbonBuster;
    const titaniumConfig = deployedContracts[8453].TitaniumBuster;

    // Read balances from all three contracts
    const { data: steelBalance } = useReadContract({
        address: steelConfig.address as `0x${string}`,
        abi: steelConfig.abi,
        functionName: "balanceOfKey",
        args: address ? [address] : undefined,
        query: { refetchInterval: 30000 },
    });

    const { data: carbonBalance } = useReadContract({
        address: carbonConfig.address as `0x${string}`,
        abi: carbonConfig.abi,
        functionName: "balanceOfKey",
        args: address ? [address] : undefined,
        query: { refetchInterval: 30000 },
    });

    const { data: titaniumBalance } = useReadContract({
        address: titaniumConfig.address as `0x${string}`,
        abi: titaniumConfig.abi,
        functionName: "balanceOfKey",
        args: address ? [address] : undefined,
        query: { refetchInterval: 30000 },
    });

    // Read reward configuration from contracts
    const { data: steelRewardConfig } = useReadContract({
        address: steelConfig.address as `0x${string}`,
        abi: steelConfig.abi,
        functionName: "rewardConfig",
        query: { refetchInterval: 30000 },
    });

    const { data: carbonRewardConfig } = useReadContract({
        address: carbonConfig.address as `0x${string}`,
        abi: carbonConfig.abi,
        functionName: "rewardConfig",
        query: { refetchInterval: 30000 },
    });

    const { data: titaniumRewardConfig } = useReadContract({
        address: titaniumConfig.address as `0x${string}`,
        abi: titaniumConfig.abi,
        functionName: "rewardConfig",
        query: { refetchInterval: 30000 },
    });

    // Calculate BSTR rewards (assuming 9 decimals for BSTR, displayed with 4 decimals)
    const calculateBSTRRewards = (
        balance: bigint | undefined,
        rewardPerUnit: bigint | undefined,
    ) => {
        if (!balance || !rewardPerUnit) return "0";
        const totalRewards = balance * rewardPerUnit;
        const formattedRewards = formatUnits(totalRewards, 9);
        // Limit to 4 decimal places for better readability
        const parts = formattedRewards.split(".");
        if (parts[1] && parts[1].length > 4) {
            return parts[0] + "." + parts[1].substring(0, 4);
        }
        return formattedRewards;
    };

    // Helper function to safely extract reward per unit from the tuple
    const getRewardPerUnit = (
        config: RewardConfig | undefined,
    ): bigint | undefined => {
        if (!config || !Array.isArray(config) || config.length < 4)
            return undefined;
        return config[3]; // perUnit is at index 3
    };

    // Extract reward per unit values from contract calls
    const steelPerUnit = getRewardPerUnit(
        steelRewardConfig as RewardConfig | undefined,
    );
    const carbonPerUnit = getRewardPerUnit(
        carbonRewardConfig as RewardConfig | undefined,
    );
    const titaniumPerUnit = getRewardPerUnit(
        titaniumRewardConfig as RewardConfig | undefined,
    );

    // Ensure we have bigint values for the calculation
    const steelPerUnitBigInt =
        steelPerUnit && typeof steelPerUnit === "bigint" ? steelPerUnit : undefined;
    const carbonPerUnitBigInt =
        carbonPerUnit && typeof carbonPerUnit === "bigint"
            ? carbonPerUnit
            : undefined;
    const titaniumPerUnitBigInt =
        titaniumPerUnit && typeof titaniumPerUnit === "bigint"
            ? titaniumPerUnit
            : undefined;

    // Calculate rewards for each collection
    const steelRewards = calculateBSTRRewards(
        steelBalance as bigint | undefined,
        steelPerUnitBigInt,
    );
    const carbonRewards = calculateBSTRRewards(
        carbonBalance as bigint | undefined,
        carbonPerUnitBigInt,
    );
    const titaniumRewards = calculateBSTRRewards(
        titaniumBalance as bigint | undefined,
        titaniumPerUnitBigInt,
    );

    const ownedCollections = [] as Array<{
        name: string;
        quantity: number;
        rewards: string;
        image: string;
    }>;

    if (steelBalance && Number(steelBalance) > 0) {
        ownedCollections.push({
            name: "Steel Key",
            quantity: Number(steelBalance),
            rewards: steelRewards,
            image: "/Cars/Steel.gif",
        });
    }
    if (carbonBalance && Number(carbonBalance) > 0) {
        ownedCollections.push({
            name: "Carbon Key",
            quantity: Number(carbonBalance),
            rewards: carbonRewards,
            image: "/Cars/Carbon.gif",
        });
    }
    if (titaniumBalance && Number(titaniumBalance) > 0) {
        ownedCollections.push({
            name: "Titanium Key",
            quantity: Number(titaniumBalance),
            rewards: titaniumRewards,
            image: "/Cars/Titanium.gif",
        });
    }

    const recommendedCollections = [
        {
            name: "Founder's Club Keys",
            description: "Unlock IRL track access and early drops with Steel, Carbon, or Titanium keys.",
            link: "https://opensea.io/collection/drvn-founders-keys",
        },
        {
            name: "BSTR Vault",
            description: "Support the DRVN treasury and earn yield-backed rewards.",
            link: "https://warpcast.com/drvnvhcls",
        },
        {
            name: "dRyft Sponsorship NFTs",
            description: "Sponsor registered VHCLs and unlock promotion slots for your brand.",
            link: "https://app.base.org/marketplace",
        },
    ];

    // Only show "connect wallet" message if viewing own profile and not connected
    // For public profiles (when profileAddress is provided), we can still show NFTs
    if (!address) {
        return (
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="text-center text-gray-400 font-mono">
                        <Key className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p>Connect your wallet to view NFT keys</p>
                    </div>
                </CardContent>
            </Card>
        );
    }


    if (ownedCollections.length === 0 && ownedSponsorships.length === 0) {
        return (
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono">
                            Digital Collectibles
                        </h2>
                        <p className="text-sm text-gray-400 font-sans">
                            {isOwner 
                                ? "You don't own any DRVN ecosystem NFTs yet. Explore the collections below to start building your profile."
                                : "This user doesn't own any DRVN ecosystem NFTs yet."
                            }
                        </p>
                    </div>
                    {isOwner && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedCollections.map((collection) => (
                                <div
                                    key={collection.name}
                                    className="p-4 rounded-xl border border-white/10 bg-black/30 flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="text-white font-semibold font-mono text-lg">
                                            {collection.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 font-sans mt-2">
                                            {collection.description}
                                        </p>
                                    </div>
                                    <a
                                        href={collection.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#00daa2] font-mono text-sm mt-4 inline-flex items-center gap-2 hover:text-green-300"
                                    >
                                        View Collection <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white font-mono">
                            Digital Collectibles
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ownedCollections.map((collection) => (
                            <div
                                key={collection.name}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-600"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden">
                                            <Image
                                                src={collection.image}
                                                alt={collection.name}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <span className="text-white font-mono font-bold">
                                            {collection.name}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-white font-mono">
                                        {collection.quantity}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-300 font-mono">
                                    BSTR Rewards: {collection.rewards}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sponsorship NFTs Section */}
                    {ownedSponsorships.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white font-mono">
                                    Sponsorship NFTs
                                </h3>
                                <span className="text-sm text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full">
                                    {ownedSponsorships.length} owned
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ownedSponsorships.map((item) => (
                                    <div
                                        key={`${item.vehicleName}-${item.sponsor.tokenId}`}
                                        className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                                    {item.sponsor.logo ? (
                                                        <Image
                                                            src={item.sponsor.logo}
                                                            alt={item.sponsor.name || "Sponsor"}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Trophy className="w-6 h-6 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">
                                                        {item.sponsor.name || `Slot #${item.sponsor.tokenId}`}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">
                                                        {item.vehicleName}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full font-medium">
                                                #{item.sponsor.tokenId}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isOwner && connectedAddress && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setSelectedSponsor({ sponsor: item.sponsor, vehicleName: item.vehicleName })}
                                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-xs"
                                                >
                                                    <Settings className="w-3 h-3 mr-1" />
                                                    Manage
                                                </Button>
                                            )}
                                            <a
                                                href={`https://opensea.io/assets/base/collection/drvn-sponsorship/${item.sponsor.tokenId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                OpenSea
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sponsor Profile Editor Modal */}
            {selectedSponsor && (
                <SponsorProfileEditorModal
                    isOpen={true}
                    onClose={() => setSelectedSponsor(null)}
                    sponsor={{
                        tokenId: selectedSponsor.sponsor.tokenId,
                        name: selectedSponsor.sponsor.name || "",
                        holderAddress: selectedSponsor.sponsor.holderAddress,
                        bio: selectedSponsor.sponsor.bio,
                        website: selectedSponsor.sponsor.websiteUrl,
                        promoLink: selectedSponsor.sponsor.promoUrl,
                        logo: selectedSponsor.sponsor.logo,
                        socialLinks: selectedSponsor.sponsor.socialLinks,
                        galleryImages: selectedSponsor.sponsor.gallery,
                    }}
                    vehicleName={selectedSponsor.vehicleName}
                />
            )}
        </>
    );
}
