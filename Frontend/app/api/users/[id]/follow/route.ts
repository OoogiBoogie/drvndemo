import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

/**
 * POST /api/users/[id]/follow
 * Follow or unfollow a user
 * 
 * Expected body:
 * {
 *   followerId: string, // ID of user performing the action
 *   action: 'follow' | 'unfollow'
 * }
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const { id: targetUserId } = params;
        const body = await req.json();
        const { followerId, action } = body;

        // Validation
        if (!followerId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (followerId === targetUserId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            );
        }

        const targetUser = await User.findById(targetUserId);
        const followerUser = await User.findById(followerId);

        if (!targetUser || !followerUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "follow") {
            // Check if already following
            if (followerUser.following.includes(targetUserId as any)) {
                return NextResponse.json(
                    { error: "Already following this user" },
                    { status: 409 }
                );
            }

            // Add to following/followers
            followerUser.following.push(targetUserId as any);
            followerUser.followingCount = (followerUser.followingCount || 0) + 1;

            targetUser.followers.push(followerId as any);
            targetUser.followerCount = (targetUser.followerCount || 0) + 1;
        } else if (action === "unfollow") {
            // Remove from following/followers
            followerUser.following = followerUser.following.filter(
                (id) => id.toString() !== targetUserId
            );
            followerUser.followingCount = Math.max(
                (followerUser.followingCount || 0) - 1,
                0
            );

            targetUser.followers = targetUser.followers.filter(
                (id) => id.toString() !== followerId
            );
            targetUser.followerCount = Math.max(
                (targetUser.followerCount || 0) - 1,
                0
            );
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await followerUser.save();
        await targetUser.save();

        return NextResponse.json({
            success: true,
            action,
            followerCount: targetUser.followerCount,
            followingCount: followerUser.followingCount,
        });
    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
