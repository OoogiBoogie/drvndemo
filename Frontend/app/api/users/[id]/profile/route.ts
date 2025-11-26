import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

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
        const user = await User.findById(id).select(
            "-email -walletAddress -createdAt -updatedAt"
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
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
        const { displayName, bio, profileImage, socialLinks } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (bio !== undefined) updateData.bio = bio;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).select("-email -walletAddress");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
