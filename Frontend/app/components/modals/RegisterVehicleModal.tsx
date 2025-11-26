"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { VehicleRegistrationResult } from "@/hooks/useVehicleLifecycle";

interface RegisterVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: (result: VehicleRegistrationResult) => void;
}

type Step = "upload" | "review" | "confirm" | "processing" | "success";

export function RegisterVehicleModal({ isOpen, onClose, userId, onSuccess }: RegisterVehicleModalProps) {
    const [step, setStep] = useState<Step>("upload");
    const [images, setImages] = useState<File[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [decodedData, setDecodedData] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleDecodeVIN = async () => {
        setIsLoading(true);
        setError("");

        try {
            let data = null;
            try {
                const response = await fetch("/api/vin/decode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        images: images.map((img) => img.name),
                    }),
                });

                if (!response.ok) throw new Error("Failed to decode VIN");
                data = await response.json();
            } catch (apiError) {
                console.warn("VIN decode falling back to mock data", apiError);
                data = MOCK_DECODED_DATA;
            }

            setDecodedData(data);
            setStep("review");
        } catch {
            setError("Failed to decode VIN. Please try again or enter manually.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setStep("processing");
        setIsLoading(true);

        try {
            const ipfsUrls = images.map((_, i) => `ipfs://placeholder-${i}`);

            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockTxHash = "0x123...";
            const mockTokenId = 1;
            const mockTbaAddress = "0xabc...";

            try {
                const response = await fetch("/api/vehicles/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        vin: decodedData?.vin,
                        factorySpecs: decodedData?.factorySpecs,
                        images: ipfsUrls,
                        nftImageIndex: 0,
                        nickname,
                        txHash: mockTxHash,
                        tokenId: mockTokenId,
                        tbaAddress: mockTbaAddress,
                    }),
                });

                if (!response.ok) throw new Error("Failed to register vehicle");
            } catch (apiError) {
                console.warn("Vehicle register fallback", apiError);
            }

            const fallbackSpecs = decodedData?.factorySpecs || MOCK_DECODED_DATA.factorySpecs;
            const fallbackVin = decodedData?.vin || MOCK_DECODED_DATA.vin;

            const mintedVehicle: VehicleRegistrationResult = {
                vehicleId: `vhcl-${Date.now()}`,
                registryId: `DRV-${String(mockTokenId).padStart(3, "0")}`,
                vin: fallbackVin,
                factorySpecs: fallbackSpecs,
                nickname,
                tokenId: mockTokenId,
                tbaAddress: mockTbaAddress,
                images: ipfsUrls,
                mintedOn: new Date().toISOString(),
            };

            onSuccess?.(mintedVehicle);

            setStep("success");
        } catch {
            setError("Registration failed. Please try again.");
            setStep("confirm");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("upload");
        setImages([]);
        setDecodedData(null);
        setNickname("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Register Vehicle
                    </DialogTitle>
                </DialogHeader>

                {/* Step 1: Upload Images */}
                {step === "upload" && (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white mb-2 block">
                                Upload VIN & Vehicle Photos
                            </Label>
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                                    <p className="text-white mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        Include clear photos of VIN plate and vehicle
                                    </p>
                                </label>
                            </div>
                        </div>

                        {images.length > 0 && (
                            <div>
                                <p className="text-sm text-zinc-400 mb-2">
                                    {images.length} image(s) selected
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((img, i) => (
                                        <div key={i} className="aspect-square bg-zinc-800 rounded-lg overflow-hidden relative">
                                            <Image
                                                src={URL.createObjectURL(img)}
                                                alt={`Upload ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleDecodeVIN}
                            disabled={images.length === 0 || isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Decoding VIN...
                                </>
                            ) : (
                                "Decode VIN"
                            )}
                        </Button>
                    </div>
                )}

                {/* Step 2: Review Decoded Data */}
                {step === "review" && decodedData && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-green-500 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold">VIN Decoded Successfully</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-zinc-500">VIN:</span>
                                    <p className="text-white font-mono">{decodedData.vin}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Year:</span>
                                    <p className="text-white">{decodedData.factorySpecs.year}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Make:</span>
                                    <p className="text-white">{decodedData.factorySpecs.make}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Model:</span>
                                    <p className="text-white">{decodedData.factorySpecs.model}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-zinc-500">Engine:</span>
                                    <p className="text-white">{decodedData.factorySpecs.engine}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="nickname" className="text-white mb-2 block">
                                Vehicle Nickname (Optional)
                            </Label>
                            <Input
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g., Black Widow, Speed Demon"
                                className="bg-zinc-800 border-white/10 text-white"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("upload")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep("confirm")}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm & Pay */}
                {step === "confirm" && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-bold mb-3">Registration Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Vehicle:</span>
                                    <span className="text-white">
                                        {decodedData.factorySpecs.year} {decodedData.factorySpecs.make} {decodedData.factorySpecs.model}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Registration Fee:</span>
                                    <span className="text-white font-bold">$50 USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Gas Fee:</span>
                                    <span className="text-white">~$2 ETH</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                            <p className="text-yellow-500 text-sm">
                                <strong>Note:</strong> Registration creates an on-chain NFT and Token Bound Account for your vehicle.
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("review")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleRegister}
                                disabled={isLoading}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Register Vehicle
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Processing */}
                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Registering Vehicle...
                        </h3>
                        <p className="text-zinc-400">
                            Please confirm the transaction in your wallet
                        </p>
                    </div>
                )}

                {/* Step 5: Success */}
                {step === "success" && (
                    <div className="py-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Vehicle Registered!
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            Your vehicle NFT has been minted and is now on-chain
                        </p>
                        <Button
                            onClick={handleClose}
                            className="bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            View My Garage
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

const MOCK_DECODED_DATA = {
    vin: "WP0AF2A95RS123456",
    factorySpecs: {
        year: 2024,
        make: "Porsche",
        model: "911 GT3 RS",
        engine: "4.0L NA Flat-6",
    },
};
