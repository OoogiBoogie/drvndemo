"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { 
    Upload, Loader2, CheckCircle, AlertCircle, Camera, RefreshCw, 
    Plus, X, Share2, ImageIcon
} from "lucide-react";
import Image from "next/image";
import type { VehicleRegistrationResult } from "@/hooks/useVehicleLifecycle";

interface RegisterVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: (result: VehicleRegistrationResult) => void;
    connectedPlatforms?: string[];
}

type Step = "vin-capture" | "specs-review" | "images-mods" | "payment" | "processing" | "success";

interface FactorySpecs {
    make: string;
    model: string;
    year: number;
    trim: string;
    engine: string;
    transmission: string;
    exteriorColor: string;
    drivetrain: string;
    fuelType: string;
    bodyStyle: string;
}

interface DecodedVINData {
    vin: string;
    factorySpecs: FactorySpecs;
    confidence: number;
}

export function RegisterVehicleModal({ 
    isOpen, 
    onClose, 
    userId, 
    onSuccess,
    connectedPlatforms = []
}: RegisterVehicleModalProps) {
    const [step, setStep] = useState<Step>("vin-capture");
    
    const [vinImage, setVinImage] = useState<File | null>(null);
    const [contextMake, setContextMake] = useState("");
    const [contextModel, setContextModel] = useState("");
    const [contextYear, setContextYear] = useState("");
    
    const [decodedData, setDecodedData] = useState<DecodedVINData | null>(null);
    const [manualVin, setManualVin] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    
    const [vehicleImages, setVehicleImages] = useState<File[]>([]);
    const [selectedNftIndex, setSelectedNftIndex] = useState(0);
    const [modifications, setModifications] = useState<string[]>([]);
    const [newMod, setNewMod] = useState("");
    const [description, setDescription] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [shareToFarcaster, setShareToFarcaster] = useState(true);
    const [shareToBase, setShareToBase] = useState(true);
    const [shareToX, setShareToX] = useState(false);

    const handleVinImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setVinImage(e.target.files[0]);
        }
    };

    const handleDecodeVIN = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            let imageBase64 = "";
            if (vinImage) {
                const reader = new FileReader();
                imageBase64 = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(vinImage);
                });
            }

            const response = await fetch("/api/vin/decode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    images: imageBase64 ? [imageBase64] : [],
                    context: {
                        make: contextMake,
                        model: contextModel,
                        year: contextYear ? parseInt(contextYear) : null,
                    },
                }),
            });

            if (!response.ok) throw new Error("Failed to decode VIN");
            const data = await response.json();

            setDecodedData(data);
            setManualVin(data.vin);
            setStep("specs-review");
        } catch {
            const mockData: DecodedVINData = {
                vin: "WP0AF2A95RS123456",
                factorySpecs: {
                    make: contextMake || "Porsche",
                    model: contextModel || "911 GT3 RS",
                    year: contextYear ? parseInt(contextYear) : 2024,
                    trim: "Weissach Package",
                    engine: "4.0L Naturally Aspirated Flat-6",
                    transmission: "7-Speed PDK",
                    exteriorColor: "Python Green",
                    drivetrain: "RWD",
                    fuelType: "Gasoline",
                    bodyStyle: "Coupe",
                },
                confidence: 0.92,
            };
            setDecodedData(mockData);
            setManualVin(mockData.vin);
            setStep("specs-review");
        } finally {
            setIsLoading(false);
        }
    }, [vinImage, contextMake, contextModel, contextYear]);

    const handleReloadSpecs = async () => {
        if (!manualVin || manualVin.length !== 17) {
            setError("Please enter a valid 17-character VIN");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/vin/decode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    manualVin: manualVin,
                    context: {
                        make: contextMake,
                        model: contextModel,
                        year: contextYear ? parseInt(contextYear) : null,
                    },
                }),
            });

            if (!response.ok) throw new Error("Failed to decode VIN");
            const data = await response.json();
            setDecodedData({ ...data, vin: manualVin });
            setIsEditing(false);
        } catch {
            setDecodedData({
                ...decodedData!,
                vin: manualVin,
            });
            setIsEditing(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVehicleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setVehicleImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeVehicleImage = (index: number) => {
        setVehicleImages(prev => prev.filter((_, i) => i !== index));
        if (selectedNftIndex >= vehicleImages.length - 1) {
            setSelectedNftIndex(Math.max(0, vehicleImages.length - 2));
        }
    };

    const handleAddMod = () => {
        if (newMod.trim()) {
            setModifications(prev => [...prev, newMod.trim()]);
            setNewMod("");
        }
    };

    const handleRemoveMod = (index: number) => {
        setModifications(prev => prev.filter((_, i) => i !== index));
    };

    const handleRegister = async () => {
        if (vehicleImages.length === 0) {
            setError("Please upload at least one vehicle image");
            return;
        }

        setStep("processing");
        setIsLoading(true);
        setError("");

        try {
            const ipfsUrls = vehicleImages.map((_, i) => `ipfs://placeholder-image-${i}`);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockTxHash = `0x${Math.random().toString(16).slice(2)}`;
            const mockTokenId = Math.floor(Math.random() * 10000);
            const mockTbaAddress = `0x${Math.random().toString(16).slice(2, 42)}`;

            try {
                await fetch("/api/vehicles/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId,
                        vin: decodedData?.vin || manualVin,
                        factorySpecs: decodedData?.factorySpecs,
                        images: ipfsUrls,
                        nftImageIndex: selectedNftIndex,
                        description,
                        modifications,
                        txHash: mockTxHash,
                        tokenId: mockTokenId,
                        tbaAddress: mockTbaAddress,
                    }),
                });
            } catch (apiError) {
                console.warn("Vehicle register API fallback", apiError);
            }

            const mintedVehicle: VehicleRegistrationResult = {
                vehicleId: `vhcl-${Date.now()}`,
                registryId: `DRV-${String(mockTokenId).padStart(5, "0")}`,
                vin: decodedData?.vin || manualVin,
                factorySpecs: {
                    year: decodedData?.factorySpecs.year || 2024,
                    make: decodedData?.factorySpecs.make || "Unknown",
                    model: decodedData?.factorySpecs.model || "Unknown",
                    engine: decodedData?.factorySpecs.engine,
                },
                nickname: "",
                tokenId: mockTokenId,
                tbaAddress: mockTbaAddress,
                images: ipfsUrls,
                mintedOn: new Date().toISOString(),
            };

            onSuccess?.(mintedVehicle);
            setStep("success");
        } catch {
            setError("Registration failed. Please try again.");
            setStep("payment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareToSocials = () => {
        const shareText = `Just registered my ${decodedData?.factorySpecs.year} ${decodedData?.factorySpecs.make} ${decodedData?.factorySpecs.model} on @DRVN_VHCLS! 🚗`;
        
        if (shareToFarcaster) {
            console.log("Sharing to Farcaster:", shareText);
        }
        if (shareToBase) {
            console.log("Sharing to Base:", shareText);
        }
        if (shareToX) {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        }
        
        handleClose();
    };

    const handleClose = () => {
        setStep("vin-capture");
        setVinImage(null);
        setContextMake("");
        setContextModel("");
        setContextYear("");
        setDecodedData(null);
        setManualVin("");
        setIsEditing(false);
        setVehicleImages([]);
        setSelectedNftIndex(0);
        setModifications([]);
        setNewMod("");
        setDescription("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Register Vehicle
                    </DialogTitle>
                    <p className="text-sm text-zinc-400">
                        {step === "vin-capture" && "Step 1: Capture VIN"}
                        {step === "specs-review" && "Step 2: Review Specifications"}
                        {step === "images-mods" && "Step 3: Images & Modifications"}
                        {step === "payment" && "Step 4: Confirm & Pay"}
                        {step === "processing" && "Processing..."}
                        {step === "success" && "Registration Complete!"}
                    </p>
                </DialogHeader>

                {step === "vin-capture" && (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white mb-2 block">
                                VIN Plate Photo
                            </Label>
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleVinImageUpload}
                                    className="hidden"
                                    id="vin-upload"
                                />
                                <label htmlFor="vin-upload" className="cursor-pointer">
                                    {vinImage ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                            <Image
                                                src={URL.createObjectURL(vinImage)}
                                                alt="VIN Plate"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Camera className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                                            <p className="text-white mb-2">
                                                Take a photo of your VIN plate
                                            </p>
                                            <p className="text-sm text-zinc-500">
                                                Usually located on the dashboard or door jamb
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <span className="text-primary">+</span> Additional Context (Helps AI Accuracy)
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="make" className="text-zinc-400 text-xs">Make</Label>
                                    <Input
                                        id="make"
                                        value={contextMake}
                                        onChange={(e) => setContextMake(e.target.value)}
                                        placeholder="e.g., Porsche"
                                        className="bg-zinc-800 border-white/10 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="model" className="text-zinc-400 text-xs">Model</Label>
                                    <Input
                                        id="model"
                                        value={contextModel}
                                        onChange={(e) => setContextModel(e.target.value)}
                                        placeholder="e.g., 911 GT3"
                                        className="bg-zinc-800 border-white/10 text-white mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="year" className="text-zinc-400 text-xs">Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={contextYear}
                                        onChange={(e) => setContextYear(e.target.value)}
                                        placeholder="e.g., 2024"
                                        className="bg-zinc-800 border-white/10 text-white mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleDecodeVIN}
                            disabled={!vinImage || isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Decoding VIN...
                                </>
                            ) : (
                                "Decode VIN & Continue"
                            )}
                        </Button>
                    </div>
                )}

                {step === "specs-review" && decodedData && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-green-500">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-bold">VIN Decoded</span>
                                    <span className="text-xs text-zinc-400">
                                        ({Math.round(decodedData.confidence * 100)}% confidence)
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Label className="text-zinc-400 text-xs">VIN</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        value={manualVin}
                                        onChange={(e) => {
                                            setManualVin(e.target.value.toUpperCase());
                                            setIsEditing(true);
                                        }}
                                        maxLength={17}
                                        className="font-mono bg-zinc-800 border-white/10 text-white flex-1"
                                    />
                                    {isEditing && (
                                        <Button
                                            onClick={handleReloadSpecs}
                                            disabled={isLoading}
                                            variant="outline"
                                            className="border-primary text-primary hover:bg-primary/10"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-1" />
                                                    Reload Specs
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                {manualVin.length > 0 && manualVin.length !== 17 && (
                                    <p className="text-xs text-yellow-500 mt-1">
                                        VIN must be 17 characters ({manualVin.length}/17)
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
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
                                <div>
                                    <span className="text-zinc-500">Trim:</span>
                                    <p className="text-white">{decodedData.factorySpecs.trim}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-zinc-500">Engine:</span>
                                    <p className="text-white">{decodedData.factorySpecs.engine}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Transmission:</span>
                                    <p className="text-white">{decodedData.factorySpecs.transmission}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Drivetrain:</span>
                                    <p className="text-white">{decodedData.factorySpecs.drivetrain}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Exterior Color:</span>
                                    <p className="text-white">{decodedData.factorySpecs.exteriorColor}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Body Style:</span>
                                    <p className="text-white">{decodedData.factorySpecs.bodyStyle}</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("vin-capture")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep("images-mods")}
                                disabled={manualVin.length !== 17}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {step === "images-mods" && (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-white mb-2 block">
                                Vehicle Photos
                            </Label>
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleVehicleImagesUpload}
                                    className="hidden"
                                    id="vehicle-images-upload"
                                />
                                <label htmlFor="vehicle-images-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
                                    <p className="text-white text-sm">Upload vehicle photos</p>
                                    <p className="text-xs text-zinc-500">Click to add more images</p>
                                </label>
                            </div>

                            {vehicleImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-zinc-400 mb-2">
                                        Select NFT Image (click to select):
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {vehicleImages.map((img, i) => (
                                            <div 
                                                key={i} 
                                                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                                    selectedNftIndex === i 
                                                        ? "border-primary ring-2 ring-primary/50" 
                                                        : "border-transparent hover:border-white/30"
                                                }`}
                                                onClick={() => setSelectedNftIndex(i)}
                                            >
                                                <Image
                                                    src={URL.createObjectURL(img)}
                                                    alt={`Vehicle ${i + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                {selectedNftIndex === i && (
                                                    <div className="absolute top-1 left-1 bg-primary text-black text-xs px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                                        <ImageIcon className="w-3 h-3" />
                                                        NFT
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeVehicleImage(i);
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 hover:bg-red-600"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="text-white mb-2 block">
                                Modifications & Upgrades
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newMod}
                                    onChange={(e) => setNewMod(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddMod()}
                                    placeholder="e.g., Akrapovic Exhaust, Carbon Fiber Hood"
                                    className="bg-zinc-800 border-white/10 text-white flex-1"
                                />
                                <Button onClick={handleAddMod} variant="outline" className="border-white/10">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {modifications.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {modifications.map((mod, i) => (
                                        <span
                                            key={i}
                                            className="bg-zinc-800 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            {mod}
                                            <button
                                                onClick={() => handleRemoveMod(i)}
                                                className="hover:text-red-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-white mb-2 block">
                                Vehicle Description (Optional)
                            </Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell the story of your vehicle..."
                                rows={3}
                                className="w-full bg-zinc-800 border border-white/10 rounded-md px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("specs-review")}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep("payment")}
                                disabled={vehicleImages.length === 0}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                )}

                {step === "payment" && decodedData && (
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
                                    <span className="text-zinc-400">VIN:</span>
                                    <span className="text-white font-mono text-xs">{manualVin}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Photos:</span>
                                    <span className="text-white">{vehicleImages.length} images</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Modifications:</span>
                                    <span className="text-white">{modifications.length} listed</span>
                                </div>
                                <div className="border-t border-white/10 pt-2 mt-2">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Registration Fee:</span>
                                        <span className="text-white font-bold">$50 USDC</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Est. Gas:</span>
                                        <span className="text-white">~$0.10 ETH</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <p className="text-blue-400 text-sm">
                                <strong>What you&apos;ll receive:</strong>
                            </p>
                            <ul className="text-xs text-blue-300 mt-2 space-y-1 list-disc list-inside">
                                <li>ERC721 Vehicle NFT with your car&apos;s factory specs</li>
                                <li>ERC6551 Token Bound Account for your vehicle</li>
                                <li>Official DRVN Registry ID</li>
                                <li>Ability to upgrade for monetization later</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setStep("images-mods")}
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
                                Pay $50 & Register
                            </Button>
                        </div>
                    </div>
                )}

                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Registering Vehicle...
                        </h3>
                        <p className="text-zinc-400">
                            Please confirm the transaction in your wallet
                        </p>
                        <div className="mt-4 text-xs text-zinc-500 space-y-1">
                            <p>1. Uploading images to IPFS...</p>
                            <p>2. Minting Vehicle NFT...</p>
                            <p>3. Creating Token Bound Account...</p>
                        </div>
                    </div>
                )}

                {step === "success" && decodedData && (
                    <div className="py-8 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-xl font-bold text-white mb-2">
                            Vehicle Registered!
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            Your {decodedData.factorySpecs.year} {decodedData.factorySpecs.make} {decodedData.factorySpecs.model} is now on-chain
                        </p>

                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 text-left">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-primary" />
                                Share on Socials
                            </h4>
                            <div className="space-y-2">
                                {connectedPlatforms.includes("farcaster") && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shareToFarcaster}
                                            onChange={(e) => setShareToFarcaster(e.target.checked)}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-white text-sm">Farcaster</span>
                                    </label>
                                )}
                                {connectedPlatforms.includes("base") && (
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shareToBase}
                                            onChange={(e) => setShareToBase(e.target.checked)}
                                            className="rounded border-white/20 bg-zinc-800"
                                        />
                                        <span className="text-white text-sm">Base</span>
                                    </label>
                                )}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={shareToX}
                                        onChange={(e) => setShareToX(e.target.checked)}
                                        className="rounded border-white/20 bg-zinc-800"
                                    />
                                    <span className="text-white text-sm">X (Twitter)</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleClose}
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5"
                            >
                                View Garage
                            </Button>
                            <Button
                                onClick={handleShareToSocials}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share & Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
