import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SocialPost from "@/lib/models/SocialPost";

/**
 * GET /api/social/posts
 * Retrieves social posts with optional filters
 * 
 * Query params:
 * - vehicleId: Filter by tagged vehicle
 * - userId: Filter by author
 * - limit: Number of posts (default: 20)
 * - skip: Pagination offset (default: 0)
 */
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const vehicleId = searchParams.get("vehicleId");
        const userId = searchParams.get("userId");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = parseInt(searchParams.get("skip") || "0");

        const filter: any = {};
        if (vehicleId) filter.taggedVehicles = vehicleId;
        if (userId) filter.author = userId;

        const posts = await SocialPost.find(filter)
            .populate("author", "username displayName profileImage")
            .populate("taggedVehicles", "nickname make model year")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await SocialPost.countDocuments(filter);

        return NextResponse.json({
            posts,
            pagination: {
                total,
                limit,
                skip,
                hasMore: skip + limit < total,
            },
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/social/posts
 * Creates a new social post
 * 
 * Expected body:
 * {
 *   authorId: string,
 *   content: string,
 *   media: string[], // IPFS URLs
 *   taggedVehicles: string[], // Vehicle IDs
 *   taggedSponsors: string[], // Sponsorship IDs
 *   farcasterCastHash?: string
 * }
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const {
            authorId,
            content,
            media,
            taggedVehicles,
            taggedSponsors,
            farcasterCastHash,
        } = body;

        // Validation
        if (!authorId || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create post
        const post = await SocialPost.create({
            author: authorId,
            content,
            media: media || [],
            taggedVehicles: taggedVehicles || [],
            taggedSponsors: taggedSponsors || [],
            farcaster: farcasterCastHash
                ? {
                    castHash: farcasterCastHash,
                    frameUrl: "", // Will be set later
                }
                : undefined,
        });

        return NextResponse.json(
            {
                success: true,
                postId: post._id,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
