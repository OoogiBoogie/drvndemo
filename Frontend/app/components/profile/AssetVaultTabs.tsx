"use client";

import { useState } from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Vault, Coins, Key, ExternalLink, Lock, Settings, Trophy } from "lucide-react";
import Image from "next/image";
import deployedContracts from "@/contracts/deployedContracts";
import { vehicles, type Sponsor } from "@/app/data/vehicleData";

type TabId = "assets" | "collectibles";

interface AssetVaultTabsProps {
    isOwner: boolean;
    profileAddress?: string;
    onSwapClick?: () => void;
    onSponsorManageClick?: (sponsor: Sponsor, vehicleName: string) => void;
}

type RewardConfig = [
    string,
    string,
    boolean,
    bigint,
    boolean,
    boolean,
    boolean,
];

const WHITELISTED_TOKENS = [
    {
        symbol: "BSTR",
        name: "Buster Token",
        address: "0x75E57aA4d00ac1Bd4DFc99fB2F3e93F70A7a87D2",
        decimals: 9,
        image: "/tokens/bstr.png",
        isEcosystem: true,
    },
    {
        symbol: "DBRO",
        name: "DeBro Token",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        decimals: 18,
        image: "/tokens/dbro.png",
        isEcosystem: false,
    },
    {
        symbol: "RYFT",
        name: "Ryft Token",
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        decimals: 18,
        image: "/tokens/ryft.png",
        isEcosystem: false,
    },
];

const SUPPORTED_COLLECTIONS = [
    {
        name: "Founder's Club Keys",
        description: "Steel, Carbon, and Titanium tier keys",
        link: "https://opensea.io/collection/drvn-founders-keys",
        image: "/Cars/Steel.gif",
    },
    {
        name: "Sponsorship NFTs",
        description: "Sponsor slots on registered vehicles",
        link: "https://opensea.io/collection/drvn-sponsorship",
        image: "/tokens/sponsor.png",
    },
];

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "assets", label: "Assets", icon: <Coins className="w-4 h-4" /> },
    { id: "collectibles", label: "Collectibles", icon: <Key className="w-4 h-4" /> },
];

export function AssetVaultTabs({ 
    isOwner, 
    profileAddress,
    onSwapClick,
    onSponsorManageClick
}: AssetVaultTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>("assets");
    const { address: connectedAddress, isConnected } = useAccount();
    
    const address = profileAddress || connectedAddress;

    const usdcConfig = deployedContracts[8453].USDC;
    const steelConfig = deployedContracts[8453].SteelBuster;
    const carbonConfig = deployedContracts[8453].CarbonBuster;
    const titaniumConfig = deployedContracts[8453].TitaniumBuster;

    const { data: usdcBalanceData } = useReadContract({
        address: usdcConfig.address as `0x${string}`,
        abi: usdcConfig.abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { refetchInterval: 30000 },
    });

    const { data: ethBalanceData } = useBalance({
        address: address as `0x${string}`,
        query: { refetchInterval: 30000 },
    });

    const { data: bstrBalanceData } = useBalance({
        address: address as `0x${string}`,
        token: WHITELISTED_TOKENS[0].address as `0x${string}`,
        query: { refetchInterval: 30000 },
    });

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

    const getRewardPerUnit = (config: RewardConfig | undefined): bigint | undefined => {
        if (!config || !Array.isArray(config) || config.length < 4) return undefined;
        return config[3];
    };

    const calculateBSTRRewards = (balance: bigint | undefined, rewardPerUnit: bigint | undefined) => {
        if (!balance || !rewardPerUnit) return "0";
        const totalRewards = balance * rewardPerUnit;
        const formattedRewards = formatUnits(totalRewards, 9);
        const parts = formattedRewards.split(".");
        if (parts[1] && parts[1].length > 4) {
            return parts[0] + "." + parts[1].substring(0, 4);
        }
        return formattedRewards;
    };

    const usdcBalance = usdcBalanceData ? formatUnits(usdcBalanceData as unknown as bigint, 6) : "0";
    const ethBalance = ethBalanceData ? formatUnits(ethBalanceData.value, 18) : "0";
    const bstrBalance = bstrBalanceData ? bstrBalanceData.formatted : "0";

    const ownedSponsorships = vehicles.flatMap(vehicle => {
        if (!vehicle.sponsors || !address) return [];
        return vehicle.sponsors
            .filter(sponsor => sponsor.holderAddress.toLowerCase() === (address as string).toLowerCase())
            .map(sponsor => ({
                sponsor,
                vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                vehicleImage: vehicle.images?.[0]?.url || "/Cars/placeholder.jpg"
            }));
    });

    const ownedCollections = [] as Array<{
        name: string;
        quantity: number;
        rewards: string;
        image: string;
    }>;

    const steelPerUnit = getRewardPerUnit(steelRewardConfig as RewardConfig | undefined);
    const carbonPerUnit = getRewardPerUnit(carbonRewardConfig as RewardConfig | undefined);
    const titaniumPerUnit = getRewardPerUnit(titaniumRewardConfig as RewardConfig | undefined);

    if (steelBalance && Number(steelBalance) > 0) {
        ownedCollections.push({
            name: "Steel Key",
            quantity: Number(steelBalance),
            rewards: calculateBSTRRewards(steelBalance as unknown as bigint, steelPerUnit),
            image: "/Cars/Steel.gif",
        });
    }
    if (carbonBalance && Number(carbonBalance) > 0) {
        ownedCollections.push({
            name: "Carbon Key",
            quantity: Number(carbonBalance),
            rewards: calculateBSTRRewards(carbonBalance as unknown as bigint, carbonPerUnit),
            image: "/Cars/Carbon.gif",
        });
    }
    if (titaniumBalance && Number(titaniumBalance) > 0) {
        ownedCollections.push({
            name: "Titanium Key",
            quantity: Number(titaniumBalance),
            rewards: calculateBSTRRewards(titaniumBalance as unknown as bigint, titaniumPerUnit),
            image: "/Cars/Titanium.gif",
        });
    }

    if (!isOwner) {
        return null;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "assets":
                return (
                    <div className="space-y-3">
                        {/* ETH Balance */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">ETH</span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Ethereum</p>
                                    <p className="text-xs text-zinc-400">Native token</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold font-mono">
                                    {isConnected ? parseFloat(ethBalance).toFixed(4) : "---"}
                                </p>
                                <p className="text-xs text-zinc-400">ETH</p>
                            </div>
                        </div>

                        {/* USDC Balance */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">USDC</span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold">USD Coin</p>
                                    <p className="text-xs text-zinc-400">Stablecoin</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold font-mono">
                                    {isConnected ? parseFloat(usdcBalance).toFixed(2) : "---"}
                                </p>
                                <p className="text-xs text-zinc-400">USDC</p>
                            </div>
                        </div>

                        {/* BSTR Balance */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-primary/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00daa2] to-[#00b894] flex items-center justify-center">
                                    <span className="text-black font-bold text-xs">BSTR</span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold">Buster Token</p>
                                    <p className="text-xs text-primary">DRVN Ecosystem</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold font-mono">
                                    {isConnected ? parseFloat(bstrBalance).toFixed(4) : "---"}
                                </p>
                                <p className="text-xs text-zinc-400">BSTR</p>
                            </div>
                        </div>

                        {/* Partner Tokens (Coming Soon) */}
                        {WHITELISTED_TOKENS.slice(1).map((token) => (
                            <div key={token.symbol} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 opacity-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <span className="text-zinc-400 font-bold text-xs">{token.symbol}</span>
                                    </div>
                                    <div>
                                        <p className="text-zinc-400 font-semibold">{token.name}</p>
                                        <p className="text-xs text-zinc-500">Partner token</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 font-mono text-sm">Coming Soon</p>
                                </div>
                            </div>
                        ))}

                        {/* Swap Button */}
                        {onSwapClick && (
                            <Button
                                onClick={onSwapClick}
                                className="w-full bg-primary hover:bg-primary/90 text-black font-bold mt-2"
                            >
                                Swap Tokens
                            </Button>
                        )}
                    </div>
                );

            case "collectibles":
                return (
                    <div className="space-y-4">
                        {/* Owned NFTs Grid */}
                        {(ownedCollections.length > 0 || ownedSponsorships.length > 0) ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {/* Founder's Keys */}
                                {ownedCollections.map((collection) => (
                                    <div
                                        key={collection.name}
                                        className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900"
                                    >
                                        <div className="relative aspect-square">
                                            <Image
                                                src={collection.image}
                                                alt={collection.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
                                                <span className="text-white font-bold text-xs">x{collection.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <p className="text-white font-semibold text-sm truncate">{collection.name}</p>
                                            <p className="text-xs text-primary">+{collection.rewards} BSTR</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Sponsorship NFTs */}
                                {ownedSponsorships.map((item) => (
                                    <div
                                        key={`${item.vehicleName}-${item.sponsor.tokenId}`}
                                        className="rounded-xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"
                                    >
                                        <div className="relative aspect-square">
                                            {item.sponsor.logo ? (
                                                <Image
                                                    src={item.sponsor.logo}
                                                    alt={item.sponsor.name || "Sponsor"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                                                    <Trophy className="w-12 h-12 text-yellow-500" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                                                <span className="text-black font-bold text-xs">#{item.sponsor.tokenId}</span>
                                            </div>
                                        </div>
                                        <div className="p-2">
                                            <p className="text-white font-semibold text-sm truncate">
                                                {item.sponsor.name || `Slot #${item.sponsor.tokenId}`}
                                            </p>
                                            <p className="text-xs text-zinc-400 truncate">{item.vehicleName}</p>
                                            <Button
                                                size="sm"
                                                onClick={() => onSponsorManageClick?.(item.sponsor, item.vehicleName)}
                                                className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold"
                                            >
                                                <Settings className="w-3 h-3 mr-1" />
                                                Manage
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-zinc-400">
                                <Key className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                                <p className="text-sm">No collectibles yet</p>
                            </div>
                        )}

                        {/* Supported Collections - Condensed */}
                        <div className="pt-3 border-t border-white/5">
                            <p className="text-xs text-zinc-500 mb-2">Supported Collections</p>
                            <div className="space-y-2">
                                {SUPPORTED_COLLECTIONS.map((collection) => (
                                    <a
                                        key={collection.name}
                                        href={collection.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5 hover:border-primary/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-800">
                                                <Image
                                                    src={collection.image}
                                                    alt={collection.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-medium">{collection.name}</p>
                                                <p className="text-[10px] text-zinc-500">{collection.description}</p>
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="w-full bg-black/40 border-white/10 backdrop-blur-md relative overflow-hidden">
            {/* Private Badge */}
            <div className="absolute top-3 right-3 z-10">
                <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full font-mono border border-purple-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                </span>
            </div>

            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Vault className="w-5 h-5 text-primary" />
                    Asset Vault
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tab Navigation - Glass Segmented Control */}
                <div className="inline-flex p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_4px_20px_rgba(0,0,0,0.4)]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            style={activeTab === tab.id ? { backgroundColor: '#00daa2' } : undefined}
                            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                activeTab === tab.id
                                    ? "!bg-[#00daa2] text-black font-bold border-[#00daa2]/50 shadow-[0_0_20px_rgba(0,218,162,0.4)]"
                                    : "text-zinc-300 border-transparent hover:text-white hover:bg-white/10 hover:border-white/10"
                            }`}
                        >
                            <span className={activeTab === tab.id ? "text-black" : "text-zinc-400"}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-b border-white/10" />

                {/* Tab Content */}
                <div className="min-h-[200px]">
                    {renderTabContent()}
                </div>
            </CardContent>
        </Card>
    );
}
