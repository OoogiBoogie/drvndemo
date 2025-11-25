import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sponsorship from "@/lib/models/Sponsorship";
import RegisteredVehicle from "@/lib/models/RegisteredVehicle";

/**
 * POST /api/sponsorship/create
 * 
 * Creates a sponsorship record after NFT mint.
 * 
 * Expected body:
 * {
 *   vehicleId: string,
 *   tokenId: string,
 *   holderAddress: string,
 *   mintTxHash: string,
 *   pricePaid: number
 * }
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { vehicleId, tokenId, holderAddress, mintTxHash, pricePaid } = body;

        // Validation
        if (!vehicleId || !tokenId || !holderAddress || !mintTxHash) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify vehicle exists and is upgraded
        const vehicle = await RegisteredVehicle.findById(vehicleId);
        if (!vehicle || !vehicle.isUpgraded) {
            return NextResponse.json(
                { error: "Vehicle not found or not upgraded" },
                { status: 404 }
            );
        }

        // Check if sponsorship already exists
        const existing = await Sponsorship.findOne({
            vehicle: vehicleId,
            tokenId,
        });
        if (existing) {
            return NextResponse.json(
                { error: "Sponsorship already exists" },
                { status: 409 }
            );
        }

        // Create sponsorship
        const sponsorship = await Sponsorship.create({
            vehicle: vehicleId,
            tokenId,
            holderAddress,
            mintTxHash,
            pricePaid,
            isClaimed: false,
        });

        return NextResponse.json(
            {
                success: true,
                sponsorshipId: sponsorship._id,
                tokenId: sponsorship.tokenId,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating sponsorship:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
