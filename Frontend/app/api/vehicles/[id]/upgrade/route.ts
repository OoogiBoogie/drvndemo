import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegisteredVehicle from "@/lib/models/RegisteredVehicle";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(
    req: NextRequest,
    context: RouteContext
) {
    try {
        await dbConnect();

        const { id } = await context.params;
        const body = await req.json();
        const { carToken, sponsorshipCollection, wrapperTxHash } = body;

        if (!carToken || !sponsorshipCollection || !wrapperTxHash) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

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
