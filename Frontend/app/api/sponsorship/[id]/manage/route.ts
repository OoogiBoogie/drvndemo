import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sponsorship from "@/lib/models/Sponsorship";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    try {
        await dbConnect();

        const { id } = await context.params;
        const sponsorship = await Sponsorship.findById(id).populate("vehicle");

        if (!sponsorship) {
            return NextResponse.json(
                { error: "Sponsorship not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ sponsorship });
    } catch (error) {
        console.error("Error fetching sponsorship:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: RouteContext
) {
    try {
        await dbConnect();

        const { id } = await context.params;
        const body = await req.json();
        const { branding } = body;

        if (!branding) {
            return NextResponse.json(
                { error: "Missing branding data" },
                { status: 400 }
            );
        }

        const sponsorship = await Sponsorship.findById(id);
        if (!sponsorship) {
            return NextResponse.json(
                { error: "Sponsorship not found" },
                { status: 404 }
            );
        }

        sponsorship.branding = branding;
        sponsorship.isClaimed = true;
        sponsorship.claimedAt = new Date();

        await sponsorship.save();

        return NextResponse.json({
            success: true,
            sponsorship: {
                id: sponsorship._id,
                branding: sponsorship.branding,
                isClaimed: sponsorship.isClaimed,
            },
        });
    } catch (error) {
        console.error("Error updating sponsorship:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
