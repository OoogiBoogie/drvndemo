"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, ShieldCheck, Zap, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { vehicles, formatCurrency, type Vehicle } from "@/app/data/vehicleData";

interface VHCLRegistryProps {
    isOwner: boolean;
    onRegisterClick: () => void;
    onVehicleClick?: (vehicle: Vehicle) => void;
}

function getStatusBadge(status?: Vehicle['status']) {
    switch (status) {
        case 'coming_soon':
            return (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                    Coming Soon
                </div>
            );
        case 'demo':
            return (
                <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-black text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <TrendingIcon />
                    Demo
                </div>
            );
        case 'live':
            return (
                <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
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

export function VHCLRegistry({ isOwner, onRegisterClick, onVehicleClick }: VHCLRegistryProps) {
    return (
        <Card className="w-full bg-black/40 border-white/10 backdrop-blur-md mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        VHCL Registry
                    </CardTitle>
                    <p className="text-xs text-zinc-400">
                        Official on-chain registered vehicles
                    </p>
                </div>
                {isOwner && (
                    <Button onClick={onRegisterClick} size="sm" className="bg-primary hover:bg-primary/90 text-black font-bold">
                        <Plus className="w-4 h-4 mr-1" />
                        Register VHCL
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vehicles.map((vehicle) => (
                            <button
                                key={vehicle._id}
                                onClick={() => onVehicleClick?.(vehicle)}
                                className="text-left w-full"
                            >
                                <div className="group relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 transition-all hover:border-primary/50 cursor-pointer">
                                    {/* Image Container */}
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
                                        
                                        {/* Status Badge */}
                                        {getStatusBadge(vehicle.status)}
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-4 bg-zinc-900/95 border-t border-white/5">
                                        {/* Year, Make & Token */}
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
                                        
                                        {/* Model Name */}
                                        <h3 className="font-bold text-white text-xl font-mono leading-tight mb-0.5">
                                            {vehicle.model}
                                        </h3>
                                        
                                        {/* Collection/Nickname */}
                                        {vehicle.collection && (
                                            <p className="text-xs text-zinc-500 mb-3">
                                                {vehicle.collection}
                                            </p>
                                        )}
                                        
                                        {/* Valuation Section */}
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            {/* Market Value */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-primary font-medium">MV</span>
                                                <span className="text-sm font-bold text-white font-mono">
                                                    {formatCurrency(vehicle.valuation.marketValue)}
                                                </span>
                                            </div>
                                            
                                            {/* Appraised Value */}
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-500 font-medium">AV</span>
                                                <span className="text-sm text-zinc-400 font-mono">
                                                    {formatCurrency(vehicle.valuation.appraisedValue)}
                                                </span>
                                            </div>
                                            
                                            {/* Spread */}
                                            {vehicle.valuation.spread !== 0 && (
                                                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                                                    <span className="text-xs text-zinc-500 font-medium">Spread</span>
                                                    <span className={`text-xs font-bold font-mono ${
                                                        vehicle.valuation.spread < 0 
                                                            ? 'text-green-400' 
                                                            : 'text-red-400'
                                                    }`}>
                                                        {vehicle.valuation.spread >= 0 ? '+' : ''}
                                                        {formatCurrency(vehicle.valuation.spread)} ({vehicle.valuation.spread >= 0 ? '+' : ''}{vehicle.valuation.spreadPercent.toFixed(1)}%)
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Sponsor Slots Preview */}
                                        {vehicle.sponsorshipCollection && (
                                            <div className="pt-3 mt-3 border-t border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                                        <span className="text-xs text-zinc-400 font-medium">Sponsors</span>
                                                    </div>
                                                    <span className="text-xs text-zinc-500">
                                                        {vehicle.sponsors.length}/{vehicle.sponsorshipCollection.maxSupply} claimed
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {/* Show claimed sponsor logos (up to 5) */}
                                                    {vehicle.sponsors.slice(0, 5).map((sponsor, idx) => (
                                                        <div 
                                                            key={sponsor.tokenId} 
                                                            className="w-7 h-7 rounded-lg border border-white/20 bg-zinc-800 overflow-hidden relative shadow-sm"
                                                            style={{ marginLeft: idx > 0 ? '-4px' : 0, zIndex: 5 - idx }}
                                                        >
                                                            {sponsor.logo ? (
                                                                <Image
                                                                    src={sponsor.logo}
                                                                    alt={sponsor.name || "Sponsor"}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                                                                    <span className="text-[8px] font-bold text-zinc-400">
                                                                        {sponsor.name?.substring(0, 2).toUpperCase() || "SP"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {/* Show remaining count if more than 5 */}
                                                    {vehicle.sponsors.length > 5 && (
                                                        <div 
                                                            className="w-7 h-7 rounded-lg border border-white/10 bg-zinc-800 flex items-center justify-center"
                                                            style={{ marginLeft: '-4px' }}
                                                        >
                                                            <span className="text-[9px] font-bold text-zinc-400">
                                                                +{vehicle.sponsors.length - 5}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Show available slots indicator */}
                                                    {vehicle.sponsorshipCollection.maxSupply - vehicle.sponsors.length > 0 && (
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <div className="w-5 h-5 rounded border border-dashed border-yellow-500/40 bg-yellow-500/5 flex items-center justify-center">
                                                                <Plus className="w-2.5 h-2.5 text-yellow-500/60" />
                                                            </div>
                                                            <span className="text-[10px] text-yellow-500/70 font-medium">
                                                                {vehicle.sponsorshipCollection.maxSupply - vehicle.sponsors.length} available
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* No Sponsorship Collection - Show Opportunity */}
                                        {!vehicle.sponsorshipCollection && vehicle.isUpgraded && (
                                            <div className="pt-3 mt-3 border-t border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Trophy className="w-3.5 h-3.5 text-zinc-500" />
                                                        <span className="text-xs text-zinc-500">No sponsors yet</span>
                                                    </div>
                                                    <span className="text-[10px] text-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                                                        Create Collection
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-zinc-900 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-zinc-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Vehicles Registered</h3>
                        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                            Register your vehicle on-chain to unlock monetization, sponsorship opportunities, and digital twin creation.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                            <div className="p-3 bg-black/40 rounded border border-white/5 text-left">
                                <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                                <h4 className="text-sm font-bold text-white">Proof of Ownership</h4>
                                <p className="text-xs text-zinc-500">Immutable on-chain record linked to your VIN.</p>
                            </div>
                            <div className="p-3 bg-black/40 rounded border border-white/5 text-left">
                                <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                                <h4 className="text-sm font-bold text-white">Monetization</h4>
                                <p className="text-xs text-zinc-500">Launch a token and earn from your car&apos;s reputation.</p>
                            </div>
                            <div className="p-3 bg-black/40 rounded border border-white/5 text-left">
                                <Trophy className="w-5 h-5 text-purple-500 mb-2" />
                                <h4 className="text-sm font-bold text-white">Sponsorships</h4>
                                <p className="text-xs text-zinc-500">Sell sponsorship slots as NFTs to brands and fans.</p>
                            </div>
                        </div>

                        {isOwner && (
                            <Button onClick={onRegisterClick} className="bg-primary hover:bg-primary/90 text-black font-bold">
                                Start Registration ($50)
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
