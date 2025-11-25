import mongoose from "mongoose";

const SocialPostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    media: [{
        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        url: {
            type: String, // IPFS URL
            required: true,
        },
    }],

    // Tagging
    taggedVehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisteredVehicle",
    }],
    taggedSponsors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sponsorship",
    }],

    // Farcaster integration
    farcasterCastHash: {
        type: String,
        unique: true,
        sparse: true,
    },
    farcasterFrameUrl: String,

    // Engagement (synced from Farcaster)
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: Number,
        default: 0,
    },
    recasts: {
        type: Number,
        default: 0,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update timestamp on save
SocialPostSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.SocialPost || mongoose.model("SocialPost", SocialPostSchema);
