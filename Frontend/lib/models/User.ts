import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username must be less than 20 characters"],
    match: [
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  xHandle: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
    default: "", // URL to the profile image
  },
  bio: {
    type: String,
    default: "", // User bio/description
    maxlength: [500, "Bio must be less than 500 characters"],
  },
  displayName: {
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
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  walletAddress: {
    type: String,
    required: [true, "Wallet address is required"],
    unique: true,
    lowercase: true,
  },
  preferences: {
    notifications: {
      postMentions: { type: Boolean, default: true },
      sponsorshipUpdates: { type: Boolean, default: true },
      vehicleActivity: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ["auto", "light", "dark"],
      default: "auto",
    },
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

// Simple pre-save hook to update timestamp
UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
