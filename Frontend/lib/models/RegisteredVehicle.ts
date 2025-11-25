import mongoose from "mongoose";

const RegisteredVehicleSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    tokenBoundAccount: {
        type: String,
        required: true,
    },

    // VIN and Specs
    vin: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    vinImageUrl: {
        type: String,
        required: true,
    },
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    factorySpecs: {
        type: Object,
        default: {},
    },

    // User-provided details
    nickname: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    modifications: [{
        type: String,
        trim: true,
    }],
    images: [{
        url: { type: String, required: true },
        isNftImage: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    }],

    // Monetization
    isUpgraded: {
        type: Boolean,
        default: false,
    },
    carToken: {
        address: String,
        ticker: String,
        supply: String,
        creatorReserve: String,
        clankerTxHash: String,
    },

    // Sponsorship
    sponsorshipCollection: {
        contractAddress: String,
        stage: {
            type: Number,
            enum: [1, 2, 3],
        },
        maxSupply: {
            type: Number,
            default: 14,
        },
        mintPrice: Number,
        offers: [{
            title: String,
            description: String,
            isStandard: Boolean,
        }],
        wrappedTokens: {
            carToken: String,
            bstr: String,
        },
    },

    registrationFee: String,
    registrationTxHash: String,
    upgradeFee: String,
    upgradeTxHash: String,

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
RegisteredVehicleSchema.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.RegisteredVehicle || mongoose.model("RegisteredVehicle", RegisteredVehicleSchema);
