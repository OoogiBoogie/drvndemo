import mongoose from "mongoose";

const SponsorshipSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisteredVehicle",
        required: true,
    },
    nftTokenId: {
        type: String,
        required: true,
    },
    nftContractAddress: {
        type: String,
        required: true,
    },
    holder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // Sponsor details
    logo: {
        type: String, // IPFS URL
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    websiteUrl: {
        type: String,
        trim: true,
    },
    promoUrl: {
        type: String,
        trim: true,
    },
    promoText: {
        type: String,
        trim: true,
    },
    socialLinks: {
        base: { type: String, trim: true },
        x: { type: String, trim: true },
        instagram: { type: String, trim: true },
        facebook: { type: String, trim: true },
        youtube: { type: String, trim: true },
        tiktok: { type: String, trim: true },
        linkedin: { type: String, trim: true },
    },
    photos: [{
        type: String, // IPFS URLs
    }],

    purchasePrice: String,
    purchaseTxHash: String,
    purchasedAt: {
        type: Date,
        default: Date.now,
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
SponsorshipSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Sponsorship || mongoose.model("Sponsorship", SponsorshipSchema);
