"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, Car, Zap, ChevronRight } from "lucide-react";
import Image from "next/image";

export interface RegisteredVehicle {
    _id: string;
    nickname?: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    registryId: string;
    images: { url: string; isNftImage: boolean }[];
    isUpgraded: boolean;
    description?: string;
    modifications?: string[];
    carToken?: {
        ticker: string;
        address: string;
    };
    createdAt: string;
}

interface RegisteredVHCLsSectionProps {
    isOwner: boolean;
    registeredVehicles: RegisteredVehicle[];
    onRegisterClick: () => void;
    onVehicleClick: (vehicle: RegisteredVehicle) => void;
}

export function RegisteredVHCLsSection({
    isOwner,
    registeredVehicles,
    onRegisterClick,
    onVehicleClick,
}: RegisteredVHCLsSectionProps) {
    const getNftImage = (vehicle: RegisteredVehicle) => {
        return vehicle.images.find(img => img.isNftImage)?.url || vehicle.images[0]?.url;
    };

    return (
        <Card className="w-full bg-black/40 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary" />
                        Registered VHCLS
                    </CardTitle>
                    <p className="text-xs text-zinc-400">
                        Your personally registered vehicles
                    </p>
                </div>
                {isOwner && (
                    <Button
                        onClick={onRegisterClick}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-black font-bold"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Register
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {registeredVehicles.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {registeredVehicles.map((vehicle) => (
                            <button
                                key={vehicle._id}
                                onClick={() => onVehicleClick(vehicle)}
                                className="text-left w-full group"
                            >
                                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-zinc-900 transition-all hover:border-primary/50">
                                    <div className="relative aspect-square">
                                        {getNftImage(vehicle) ? (
                                            <Image
                                                src={getNftImage(vehicle) || ""}
                                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                <Car className="w-10 h-10 text-zinc-600" />
                                            </div>
                                        )}
                                        
                                        {vehicle.isUpgraded && (
                                            <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-black" />
                                                {vehicle.carToken && (
                                                    <span className="text-[10px] font-bold text-black">
                                                        ${vehicle.carToken.ticker}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                            <p className="text-[10px] text-zinc-400 font-mono uppercase">
                                                {vehicle.registryId}
                                            </p>
                                            <h3 className="text-sm font-bold text-white truncate">
                                                {vehicle.nickname || vehicle.model}
                                            </h3>
                                            <p className="text-xs text-zinc-400">
                                                {vehicle.year} {vehicle.make}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <ChevronRight className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-zinc-900 rounded-full">
                                <Car className="w-8 h-8 text-zinc-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            No Registered Vehicles
                        </h3>
                        <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">
                            Register your first vehicle to mint an NFT with your VIN and unlock monetization features.
                        </p>
                        {isOwner && (
                            <Button
                                onClick={onRegisterClick}
                                className="bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Register Vehicle ($50)
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
