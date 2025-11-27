"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, ShieldCheck, Wallet, Trophy, Car, Settings, ExternalLink } from "lucide-react";
import Image from "next/image";
import { vehicles, formatCurrency, type Vehicle, type Sponsor } from "@/app/data/vehicleData";

type TabId = "rwa" | "registry" | "collection" | "sponsored";

interface VHCLCollectionTabsProps {
    isOwner: boolean;
    profileAddress?: string;
    onRegisterClick: () => void;
    onVehicleClick?: (vehicle: Vehicle) => void;
    onSponsorDashboardClick?: (sponsor: Sponsor, vehicleName: string) => void;
}

interface RWAHolding {
    id: string;
    name: string;
    ticker: string;
    sharesOwned: number;
    totalShares: number;
    usdValue: number;
    change24h: number;
    image: string;
}

function getStatusBadge(status?: Vehicle['status']) {
    switch (status) {
        case 'coming_soon':
            return (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    Coming Soon
                </div>
            );
        case 'demo':
            return (
                <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-black text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <TrendingIcon />
                    Demo
                </div>
            );
        case 'live':
            return (
                <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Live
                </div>
            );
        default:
            return null;
    }
}

function TrendingIcon() {
    return (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "rwa", label: "RWA Collection", icon: <Wallet className="w-4 h-4" /> },
    { id: "registry", label: "VHCL Registry", icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "collection", label: "VHCL Collection", icon: <Car className="w-4 h-4" /> },
    { id: "sponsored", label: "Sponsored VHCLs", icon: <Trophy className="w-4 h-4" /> },
];

export function VHCLCollectionTabs({ 
    isOwner, 
    profileAddress,
    onRegisterClick, 
    onVehicleClick,
    onSponsorDashboardClick
}: VHCLCollectionTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>("rwa");

    const mockRWAHoldings: RWAHolding[] = [
        {
            id: "rwa-gt3",
            name: "Porsche 911 GT3 RS",
            ticker: "GT3RS",
            sharesOwned: 1250,
            totalShares: 10000,
            usdValue: 27500,
            change24h: 2.4,
            image: "/Cars/modena1.jpg",
        },
        {
            id: "rwa-r34",
            name: "Nissan R34 GT-R",
            ticker: "R34GTR",
            sharesOwned: 890,
            totalShares: 8000,
            usdValue: 18200,
            change24h: -1.1,
            image: "/Cars/GtrHero1.jpg",
        },
        {
            id: "rwa-nsx",
            name: "Honda NSX Type S",
            ticker: "NSXTS",
            sharesOwned: 640,
            totalShares: 7500,
            usdValue: 15980,
            change24h: 0.9,
            image: "/Cars/nsx-ts-2.jpg",
        },
    ];

    const mockOtherVehicles: Vehicle[] = vehicles.filter(v => v.isUpgraded).slice(0, 3);
    
    const ownedSponsorships = vehicles.flatMap(vehicle => {
        if (!vehicle.sponsors || !profileAddress) return [];
        return vehicle.sponsors
            .filter(sponsor => sponsor.holderAddress.toLowerCase() === profileAddress.toLowerCase())
            .map(sponsor => ({
                sponsor,
                vehicle,
                vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                vehicleImage: vehicle.images?.[0]?.url || "/Cars/placeholder.jpg"
            }));
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case "rwa":
                return (
                    <div className="space-y-3">
                        {mockRWAHoldings.length > 0 ? (
                            mockRWAHoldings.map((holding) => (
                                <div
                                    key={holding.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer"
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <Image
                                            src={holding.image}
                                            alt={holding.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-white font-bold truncate">{holding.name}</h4>
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 flex-shrink-0">
                                                ${holding.ticker}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-400">
                                            {holding.sharesOwned.toLocaleString()} shares · {((holding.sharesOwned / holding.totalShares) * 100).toFixed(2)}% ownership
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-white font-bold font-mono">
                                            ${holding.usdValue.toLocaleString()}
                                        </p>
                                        <p className={`text-xs font-mono ${holding.change24h >= 0 ? 'text-[#00daa2]' : 'text-red-400'}`}>
                                            {holding.change24h >= 0 ? '+' : ''}{holding.change24h}%
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-400">
                                <Wallet className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                                <p>No RWA tokens held yet</p>
                                <p className="text-sm text-zinc-500 mt-1">Explore the marketplace to buy shares in vehicles</p>
                            </div>
                        )}
                    </div>
                );

            case "registry":
                return (
                    <div>
                        {isOwner && (
                            <div className="flex justify-end mb-4">
                                <Button onClick={onRegisterClick} size="sm" className="bg-primary hover:bg-primary/90 text-black font-bold">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Register New VHCL
                                </Button>
                            </div>
                        )}
                        {vehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vehicles.map((vehicle) => (
                                    <button
                                        key={vehicle._id}
                                        onClick={() => onVehicleClick?.(vehicle)}
                                        className="text-left w-full"
                                    >
                                        <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 transition-all hover:border-primary/50 cursor-pointer">
                                            <div className="relative aspect-video">
                                                {vehicle.images && vehicle.images[0] ? (
                                                    <Image
                                                        src={vehicle.images[0].url}
                                                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                                        No Image
                                                    </div>
                                                )}
                                                {getStatusBadge(vehicle.status)}
                                            </div>
                                            <div className="p-4 bg-zinc-900/95 border-t border-white/5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                                                        {vehicle.year} {vehicle.make}
                                                    </p>
                                                    {vehicle.isUpgraded && vehicle.carToken && (
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                            ${vehicle.carToken.ticker}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-white text-lg font-mono leading-tight mb-1">
                                                    {vehicle.model}
                                                </h3>
                                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                    <span className="text-xs text-primary font-medium">MV</span>
                                                    <span className="text-sm font-bold text-white font-mono">
                                                        {formatCurrency(vehicle.valuation.marketValue)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                                <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                                <h3 className="text-lg font-medium text-white mb-2">No Vehicles Registered</h3>
                                <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">
                                    Register your vehicle on-chain to unlock monetization and sponsorship opportunities.
                                </p>
                                {isOwner && (
                                    <Button onClick={onRegisterClick} className="bg-primary hover:bg-primary/90 text-black font-bold">
                                        Start Registration ($50)
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                );

            case "collection":
                return (
                    <div>
                        {mockOtherVehicles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {mockOtherVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle._id}
                                        onClick={() => onVehicleClick?.(vehicle)}
                                        className="text-left w-full"
                                    >
                                        <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 transition-all hover:border-primary/50 cursor-pointer">
                                            <div className="relative aspect-video">
                                                {vehicle.images && vehicle.images[0] ? (
                                                    <Image
                                                        src={vehicle.images[0].url}
                                                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-zinc-900/95 border-t border-white/5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                                                        {vehicle.year} {vehicle.make}
                                                    </p>
                                                    {vehicle.carToken && (
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                            ${vehicle.carToken.ticker}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-white text-lg font-mono leading-tight mb-1">
                                                    {vehicle.model}
                                                </h3>
                                                <p className="text-xs text-zinc-500">
                                                    Owner: @{vehicle.collection?.toLowerCase().replace(/\s/g, '') || 'user'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-400">
                                <Car className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                                <p>No vehicles in collection yet</p>
                                <p className="text-sm text-zinc-500 mt-1">Collect tokenized vehicles from other users</p>
                            </div>
                        )}
                    </div>
                );

            case "sponsored":
                return (
                    <div>
                        {ownedSponsorships.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ownedSponsorships.map((item) => (
                                    <div
                                        key={`${item.vehicleName}-${item.sponsor.tokenId}`}
                                        className="rounded-xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 hover:border-yellow-500/40 transition-colors"
                                    >
                                        <div className="relative aspect-video">
                                            <Image
                                                src={item.vehicleImage}
                                                alt={item.vehicleName}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="text-white font-bold">{item.vehicleName}</p>
                                                <p className="text-xs text-yellow-400">Slot #{item.sponsor.tokenId}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                                                    {item.sponsor.logo ? (
                                                        <Image
                                                            src={item.sponsor.logo}
                                                            alt={item.sponsor.name || "Sponsor"}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">
                                                        {item.sponsor.name || `Sponsor Slot #${item.sponsor.tokenId}`}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">Your sponsorship</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => onSponsorDashboardClick?.(item.sponsor, item.vehicleName)}
                                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-xs"
                                                >
                                                    <Settings className="w-3 h-3 mr-1" />
                                                    Manage
                                                </Button>
                                                <a
                                                    href={`https://opensea.io/assets/base/collection/drvn-sponsorship/${item.sponsor.tokenId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-1 h-8 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors text-xs text-blue-400"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-400">
                                <Trophy className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                                <p>No sponsorship NFTs owned</p>
                                <p className="text-sm text-zinc-500 mt-1">Sponsor vehicles to unlock promotion slots and DM the owner</p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-full bg-black/40 border-white/10 backdrop-blur-md overflow-hidden box-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    VHCL Collection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tab Navigation - Glass Segmented Control */}
                <div className="inline-flex p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_4px_20px_rgba(0,0,0,0.4)] overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            style={activeTab === tab.id ? { backgroundColor: '#00daa2' } : undefined}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                                activeTab === tab.id
                                    ? "!bg-[#00daa2] text-black font-bold border-[#00daa2]/50 shadow-[0_0_20px_rgba(0,218,162,0.4)]"
                                    : "text-zinc-300 border-transparent hover:text-white hover:bg-white/10 hover:border-white/10"
                            }`}
                        >
                            <span className={activeTab === tab.id ? "text-black" : "text-zinc-400"}>
                                {tab.icon}
                            </span>
                            <span className="hidden sm:inline">{tab.label}</span>
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
