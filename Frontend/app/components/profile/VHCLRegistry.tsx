"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, ShieldCheck, Zap, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RegisteredVehicle {
    _id: string;
    nickname?: string;
    make: string;
    model: string;
    year: number;
    images: { url: string; isNftImage: boolean }[];
    isUpgraded: boolean;
    carToken?: {
        ticker: string;
    };
}

interface VHCLRegistryProps {
    vehicles: RegisteredVehicle[];
    isOwner: boolean;
    onRegisterClick: () => void;
}

export function VHCLRegistry({ vehicles, isOwner, onRegisterClick }: VHCLRegistryProps) {
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
                            <Link key={vehicle._id} href={`/vehicles/${vehicle._id}`}>
                                <div className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-zinc-900 transition-all hover:border-primary/50">
                                    {/* Image */}
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

                                    {/* Overlay Info */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight">
                                                    {vehicle.nickname || `${vehicle.year} ${vehicle.model}`}
                                                </h3>
                                                <p className="text-xs text-zinc-300">
                                                    {vehicle.make}
                                                </p>
                                            </div>
                                            {vehicle.isUpgraded && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                        ${vehicle.carToken?.ticker}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
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
                                <p className="text-xs text-zinc-500">Launch a token and earn from your car's reputation.</p>
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
