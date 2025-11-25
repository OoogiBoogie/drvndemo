import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisteredVehicle from "@/lib/models/RegisteredVehicle";

/**
 * POST /api/vehicles/[id]/upgrade
 * 
 * Upgrades a registered vehicle to monetized status.
 * 
 * Expected body:
 * {
 *   carToken: {
 *     ticker: string,
 *     address: string,
 *     clankerCastHash: string
 *   },
 *   sponsorshipCollection: {
 *     contractAddress: string,
 *     tier: 'bronze' | 'silver' | 'gold',
 *     maxSupply: 14,
 *     mintPrice: number
 *   },
 *   wrapperTxHash: string
 * }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id } = params;
        const body = await req.json();
        const { carToken, sponsorshipCollection, wrapperTxHash } = body;

        // Validation
        if (!carToken || !sponsorshipCollection || !wrapperTxHash) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find vehicle
        const vehicle = await RegisteredVehicle.findById(id);
        if (!vehicle) {
            return NextResponse.json(
                { error: "Vehicle not found" },
                { status: 404 }
            );
        }

        if (vehicle.isUpgraded) {
            return NextResponse.json(
                { error: "Vehicle already upgraded" },
                { status: 409 }
            );
        }

        // Update vehicle
        vehicle.isUpgraded = true;
        vehicle.carToken = carToken;
        vehicle.sponsorshipCollection = sponsorshipCollection;
        vehicle.upgradeTx = wrapperTxHash;
        vehicle.upgradedAt = new Date();

        await vehicle.save();

        return NextResponse.json({
            success: true,
            vehicle: {
                id: vehicle._id,
                isUpgraded: vehicle.isUpgraded,
                carToken: vehicle.carToken,
                sponsorshipCollection: vehicle.sponsorshipCollection,
            },
        });
    } catch (error) {
        console.error("Error upgrading vehicle:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
