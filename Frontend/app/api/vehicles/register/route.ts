import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisteredVehicle from "@/lib/models/RegisteredVehicle";
import User from "@/lib/models/User";

/**
 * POST /api/vehicles/register
 * 
 * Registers a new vehicle on-chain and in the database.
 * 
 * Expected body:
 * {
 *   userId: string,
 *   vin: string,
 *   factorySpecs: { make, model, year, trim, engine, transmission, color },
 *   images: string[], // IPFS URLs
 *   nftImageIndex: number,
 *   nickname?: string,
 *   txHash: string, // Transaction hash from VehicleRegistry.registerVehicle
 *   tokenId: number,
 *   tbaAddress: string
 * }
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const {
            userId,
            vin,
            factorySpecs,
            images,
            nftImageIndex,
            nickname,
            txHash,
            tokenId,
            tbaAddress,
        } = body;

        // Validation
        if (!userId || !vin || !factorySpecs || !images || !txHash || !tokenId || !tbaAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if VIN already registered
        const existing = await RegisteredVehicle.findOne({ vin });
        if (existing) {
            return NextResponse.json(
                { error: "Vehicle already registered" },
                { status: 409 }
            );
        }

        // Create vehicle record
        const vehicle = await RegisteredVehicle.create({
            owner: userId,
            vin,
            factorySpecs,
            images,
            nftImageIndex: nftImageIndex || 0,
            nickname,
            registrationTx: txHash,
            tokenId,
            tbaAddress,
            isUpgraded: false,
        });

        // Update user's registered vehicles count (optional denormalization)
        await User.findByIdAndUpdate(userId, {
            $inc: { registeredVehiclesCount: 1 },
        });

        return NextResponse.json(
            {
                success: true,
                vehicleId: vehicle._id,
                tokenId: vehicle.tokenId,
                tbaAddress: vehicle.tbaAddress,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering vehicle:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
