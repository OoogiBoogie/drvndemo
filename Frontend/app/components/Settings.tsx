/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Edit,
  Save,
  X,
  User,
  FileText,
  Shield,
  HelpCircle,
  Upload,
} from "lucide-react";
import { SocialLinksEditor } from "./settings/SocialLinksEditor";
import { NotificationToggles } from "./settings/NotificationToggles";
import { ThemeSelector } from "./settings/ThemeSelector";
import { WalletManagementModal } from "./modals/WalletManagementModal";
import Image from "next/image";

/**
 * User interface representing the structure of user data
 * This matches the MongoDB schema and API responses
 */
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  displayName?: string;
  xHandle?: string;
  profileImage?: string;
  walletAddress: string;
  bio?: string;
  socialLinks?: {
    farcaster?: string;
    base?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  preferences?: {
    notifications: {
      postMentions: boolean;
      sponsorshipUpdates: boolean;
      vehicleActivity: boolean;
    };
    theme: "auto" | "light" | "dark";
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Props interface for the Settings component
 * @param currentUser - The currently authenticated user's data
 * @param isAuthenticated - Boolean indicating if user is authenticated
 * @param refreshUserData - Optional callback to refresh user data in parent component
 */
interface SettingsProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  refreshUserData?: () => void; // Refresh callback
}

/**
 * Settings Component
 *
 * This component provides a comprehensive user profile management interface
 * where users can view and edit their profile information including:
 * - Profile image upload
 * - Username, first name, last name
 * - Bio/description
 * - Real-time username validation
 *
 * The component includes:
 * - Edit mode toggle for profile fields
 * - Image upload functionality
 * - Username availability checking
 * - Form validation and error handling
 * - Success/error message display
 * - Additional settings sections (Accounts, Newsletter, About)
 */
export function Settings({
  currentUser,
  isAuthenticated,
  refreshUserData,
}: SettingsProps) {
  // Wagmi hook to get connected wallet information
  const { address, isConnected } = useAccount();

  // State management for component functionality
  const [isEditing, setIsEditing] = useState(false); // Controls edit mode
  const [isLoading, setIsLoading] = useState(false); // Loading state for save operations
  const [isUploading, setIsUploading] = useState(false); // Loading state for image uploads

  // Form data state - holds current values being edited
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    bio: "",
    profileImage: "",
  });

  // Social links state
  const [socialLinks, setSocialLinks] = useState({
    farcaster: "",
    base: "",
    x: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
    linkedin: "",
  });

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    postMentions: true,
    sponsorshipUpdates: true,
    vehicleActivity: true,
  });

  // Theme preference state
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");

  // Modal states
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // UI state for user feedback
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [usernameError, setUsernameError] = useState(""); // Username validation error

  /**
   * Fetch editable user data (decrypted) for form editing
   */
  const fetchEditableUserData = useCallback(async () => {
    if (!currentUser?.walletAddress) return;

    try {
      const response = await fetch("/api/auth/user/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: currentUser.walletAddress }),
      });

      if (response.ok) {
        const userData = await response.json();
        const editableUser = userData.user;

        // Set form data with decrypted values
        setFormData({
          username: editableUser.username || "",
          firstName: editableUser.firstName || "",
          lastName: editableUser.lastName || "",
          displayName: editableUser.displayName || "",
          email: editableUser.email || "",
          bio: editableUser.bio || "",
          profileImage: editableUser.profileImage || "",
        });

        // Set social links
        setSocialLinks(editableUser.socialLinks || {
          farcaster: "",
          base: "",
          x: "",
          instagram: "",
          facebook: "",
          youtube: "",
          tiktok: "",
          linkedin: "",
        });

        // Set notification preferences
        setNotificationPreferences(editableUser.preferences?.notifications || {
          postMentions: true,
          sponsorshipUpdates: true,
          vehicleActivity: true,
        });

        // Set theme preference
        setTheme(editableUser.preferences?.theme || "auto");
      }
    } catch (error) {
      console.error("Error fetching editable user data:", error);
      // Fallback to current user data if edit endpoint fails
      setFormData({
        username: currentUser.username || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        profileImage: currentUser.profileImage || "",
      });

      setSocialLinks({
        farcaster: currentUser.socialLinks?.farcaster || "",
        base: currentUser.socialLinks?.base || "",
        x: currentUser.socialLinks?.x || "",
        instagram: currentUser.socialLinks?.instagram || "",
        facebook: currentUser.socialLinks?.facebook || "",
        youtube: currentUser.socialLinks?.youtube || "",
        tiktok: currentUser.socialLinks?.tiktok || "",
        linkedin: currentUser.socialLinks?.linkedin || "",
      });

      setNotificationPreferences(currentUser.preferences?.notifications || {
        postMentions: true,
        sponsorshipUpdates: true,
        vehicleActivity: true,
      });

      setTheme(currentUser.preferences?.theme || "auto");
    }
  }, [currentUser]);

  /**
   * Initialize form data when user data changes
   * This ensures the form always reflects the current user's data
   */
  useEffect(() => {
    if (currentUser) {
      fetchEditableUserData();
    }
  }, [currentUser, fetchEditableUserData]);

  // Show connect wallet prompt if wallet not connected or user not authenticated
  if (!isConnected || !isAuthenticated || !currentUser) {
    return (
      <Card className="w-full bg-black/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00daa2]/20 to-[#8351a1]/20 flex items-center justify-center border border-white/10">
            <User className="w-10 h-10 text-[#00daa2]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-mono">
              Connect Your Wallet
            </h2>
            <p className="text-zinc-400 max-w-md">
              Connect your wallet to access your profile settings, customize your experience, and manage your social links.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-sm text-zinc-500">
              Click the <span className="text-[#00daa2] font-mono">SIGN UP/LOGIN</span> button in the sidebar to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Handles input changes for form fields
   * Updates the form state and clears username errors when typing
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear username error when user types to provide immediate feedback
    if (field === "username") {
      setUsernameError("");
    }
  };

  /**
   * Handles profile image upload
   * Sends file to upload API and updates form state with returned URL
   */
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          profileImage: data.url,
        }));
        setMessage({
          type: "success",
          text: "Profile image uploaded successfully!",
        });
      } else {
        setMessage({ type: "error", text: "Failed to upload image" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error uploading image" });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Validates username availability
   * Checks if username is available (not taken by another user)
   * Skips validation if username hasn't changed
   */
  const validateUsername = async (username: string) => {
    if (username === currentUser.username) return true;

    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, walletAddress: address }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.available) {
          setUsernameError("");
          return true;
        } else {
          setUsernameError("Username already taken");
          return false;
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }

    return false;
  };

  /**
   * Handles saving profile changes
   * Validates username, sends update request, and refreshes parent data
   */
  const handleSave = async () => {
    if (!address) return;

    // Validate username before saving to prevent conflicts
    const isUsernameValid = await validateUsername(formData.username);
    if (!isUsernameValid) return;

    // Saving user data...

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          email: formData.email,
          bio: formData.bio,
          profileImage: formData.profileImage,
          socialLinks,
          preferences: {
            notifications: notificationPreferences,
            theme,
          },
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        // Refresh user data in parent component to sync changes
        if (refreshUserData) {
          refreshUserData();
        }
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.error || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred while updating profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles canceling edit mode
   * Resets form data to original values and clears any errors
   */
  const handleCancel = () => {
    // Reset form data to original values from currentUser
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        displayName: currentUser.displayName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        profileImage: currentUser.profileImage || "",
      });

      setSocialLinks({
        farcaster: currentUser.socialLinks?.farcaster || "",
        base: currentUser.socialLinks?.base || "",
        x: currentUser.socialLinks?.x || "",
        instagram: currentUser.socialLinks?.instagram || "",
        facebook: currentUser.socialLinks?.facebook || "",
        youtube: currentUser.socialLinks?.youtube || "",
        tiktok: currentUser.socialLinks?.tiktok || "",
        linkedin: currentUser.socialLinks?.linkedin || "",
      });

      setNotificationPreferences(currentUser.preferences?.notifications || {
        postMentions: true,
        sponsorshipUpdates: true,
        vehicleActivity: true,
      });

      setTheme(currentUser.preferences?.theme || "auto");
    }
    setIsEditing(false);
    setMessage(null);
    setUsernameError("");
  };

  /**
   * Handles social link changes
   */
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  /**
   * Handles notification preference changes
   */
  const handleNotificationChange = (
    key: "postMentions" | "sponsorshipUpdates" | "vehicleActivity",
    value: boolean
  ) => {
    setNotificationPreferences((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Handles newsletter subscription
   */
  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterMessage({ type: "error", text: "Please enter a valid email" });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (response.ok) {
        setNewsletterMessage({ type: "success", text: "Successfully subscribed to newsletter!" });
        setNewsletterEmail("");
      } else {
        const error = await response.json();
        setNewsletterMessage({ type: "error", text: error.message || "Failed to subscribe" });
      }
    } catch (error) {
      // Fallback for when endpoint doesn't exist yet
      setNewsletterMessage({ type: "success", text: "Subscription request received! (Mock)" });
      setNewsletterEmail("");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section - Shows XP indicator for future features */}
        <div className="flex items-center justify-between">
          <div className="bg-black/80 border border-purple-500 px-3 py-1 rounded">
            <span className="text-white text-sm">XP / coming soon</span>
          </div>
        </div>

        {/* Main User Profile Section */}
        <Card className="bg-gray-900/50 border border-purple-500/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Profile Image Container with Upload Functionality */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00daa2]">
                    {formData.profileImage ? (
                      <Image
                        src={formData.profileImage}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback gradient background with user icon when no image
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Image Upload Button - Only visible in edit mode */}
                  {isEditing && (
                    <div className="absolute -bottom-1 -right-1">
                      <label
                        htmlFor="profile-image-upload"
                        className="cursor-pointer"
                      >
                        <div className="w-6 h-6 bg-[#00daa2] rounded-full flex items-center justify-center hover:bg-[#00cc6a] transition-colors">
                          <Upload className="w-3 h-3 text-black" />
                        </div>
                      </label>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Username Display/Edit Field */}
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">
                    {isEditing ? (
                      <Input
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="bg-gray-800 border-gray-600 text-white w-32"
                        placeholder="Username"
                      />
                    ) : (
                      currentUser.username || "No username set"
                    )}
                  </h2>
                </div>

                {/* Edit Button - Only visible when not editing */}
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    className="text-[#00daa2] hover:text-[#00daa2] hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Form Fields - Grid layout for first/last name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name Field */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-mono">
                  First Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="First Name"
                  />
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                    {currentUser.firstName || "No first name set"}
                  </div>
                )}
              </div>

              {/* Last Name Field */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm font-mono">
                  Last Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Last Name"
                  />
                ) : (
                  <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                    {currentUser.lastName || "No last name set"}
                  </div>
                )}
              </div>
            </div>

            {/* Display Name Field */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-mono">
                Display Name
              </label>
              {isEditing ? (
                <Input
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Display Name (shown on your profile)"
                />
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                  {currentUser.displayName || "No display name set"}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-mono">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="your.email@example.com"
                />
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                  {currentUser.email || "No email set"}
                </div>
              )}
            </div>

            {/* Bio Field - Larger textarea for longer content */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-mono">Bio</label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 py-3 text-white min-h-[100px]">
                  {currentUser.bio || "No bio set"}
                </div>
              )}
            </div>

            {/* Username Field - Separate section with validation */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-mono">
                Username
              </label>
              {isEditing ? (
                <div>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={`bg-gray-800 border-gray-600 text-white ${
                      usernameError ? "border-red-500" : ""
                    }`}
                    placeholder="Username"
                  />
                  {/* Username validation error display */}
                  {usernameError && (
                    <p className="text-red-400 text-xs mt-1">{usernameError}</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
                  {currentUser.username || "No username set"}
                </div>
              )}
            </div>

            {/* Social Links Section */}
            {isEditing && (
              <div className="pt-4 border-t border-gray-700">
                <SocialLinksEditor
                  socialLinks={socialLinks}
                  onChange={handleSocialLinkChange}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Notification Preferences Section */}
            <div className="pt-4 border-t border-gray-700">
              <NotificationToggles
                preferences={notificationPreferences}
                onChange={handleNotificationChange}
                disabled={!isEditing || isLoading}
              />
            </div>

            {/* Theme Selector Section */}
            <div className="pt-4 border-t border-gray-700">
              <ThemeSelector
                value={theme}
                onChange={setTheme}
                disabled={!isEditing || isLoading}
              />
            </div>

            {/* Action Buttons - Save/Cancel when editing */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || isUploading}
                  className="bg-[#00daa2] text-black hover:bg-[#00cc6a] font-mono"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-600 text-white hover:bg-gray-800 font-mono"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            {/* Success/Error Message Display */}
            {message && (
              <div
                className={`p-3 rounded border ${
                  message.type === "success"
                    ? "bg-green-900/20 border-green-500 text-green-400"
                    : "bg-red-900/20 border-red-500 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings Sections */}
        <div className="space-y-4">
          {/* Accounts Section - Wallet management */}
          <div>
            <h3 className="text-white font-semibold mb-3 font-mono">
              Accounts
            </h3>
            <button
              onClick={() => setShowWalletModal(true)}
              className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-mono">Manage Wallets</span>
                </div>
                <div className="text-[#00daa2]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Newsletter Section - Email signup */}
          <div>
            <h3 className="text-white font-semibold mb-3 font-mono">
              Newsletter
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-mono">
                  Sign Up For Our Newsletter
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-gray-900 border-gray-600 text-white flex-1"
                  disabled={newsletterLoading}
                />
                <Button
                  onClick={handleNewsletterSubscribe}
                  disabled={newsletterLoading || !newsletterEmail}
                  className="bg-[#00daa2] text-black hover:bg-[#00cc6a] font-mono"
                >
                  {newsletterLoading ? "..." : "Subscribe"}
                </Button>
              </div>
              {newsletterMessage && (
                <p
                  className={`text-xs ${
                    newsletterMessage.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {newsletterMessage.text}
                </p>
              )}
            </div>
          </div>

          {/* About Section - Legal and support links */}
          <div>
            <h3 className="text-white font-semibold mb-3 font-mono">About</h3>
            <div className="space-y-3">
              {/* Legal and Policies */}
              <a
                href="/legal/privacy-policy"
                className="block bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-mono">
                      Legal And Policies
                    </span>
                  </div>
                  <div className="text-[#00daa2]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </a>

              {/* Contact and Links */}
              <a
                href="/support"
                className="block bg-gray-800 rounded-lg p-4 border border-gray-700 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-mono">
                      Contact & Links
                    </span>
                  </div>
                  <div className="text-[#00daa2]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Wallet Management Modal */}
        <WalletManagementModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />

        {/* Version Footer - App version indicator */}
        <div className="text-center pt-8">
          <span className="text-gray-400 text-sm font-mono">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
