"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Loader2, User } from "lucide-react";
import { useAccount } from "wagmi";
import Image from "next/image";
import {} from // Wallet,
// WalletDropdown,
// WalletDropdownDisconnect,
// ConnectWallet,
"@coinbase/onchainkit/wallet";
import {} from // Name,
// Avatar,
// Address,
// EthBalance,
"@coinbase/onchainkit/identity";
import { uploadImageToIpfs } from "../../../utils/ipfs";
import { ConnectButton } from "../web3/ConnectButton";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignin: () => void;
  onSuccess: () => void;
  allowClose?: boolean; // If false, hide close button until signup is complete
}

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToSignin,
  onSuccess,
  allowClose = true,
}: SignupModalProps) {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    xHandle: "",
    profileImage: "",
    bio: "", // Add bio field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Check if all required fields are filled (including profile image)
  const isFormValid =
    address &&
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.email.trim() !== "" &&
    selectedFile !== null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadToIpfs = async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error("No file selected");
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const ipfsUrl = await uploadImageToIpfs(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setIsUploading(false);
      setUploadProgress(0);
      return ipfsUrl;
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Profile image is required - upload it to IPFS
      if (!selectedFile) {
        setError("Please upload a profile image");
        setIsLoading(false);
        return;
      }

      let finalProfileImage: string;
      try {
        finalProfileImage = await handleUploadToIpfs();
        console.log("Image uploaded to IPFS:", finalProfileImage);
      } catch (uploadError) {
        console.error("Failed to upload image to IPFS:", uploadError);
        setError("Failed to upload profile image. Please try again.");
        setIsLoading(false);
        return;
      }

      // Debug: Log what's being sent
      console.log("Form data being sent:", {
        ...formData,
        profileImage: finalProfileImage,
        walletAddress: address,
      });

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          profileImage: finalProfileImage,
          walletAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        xHandle: "",
        profileImage: "",
        bio: "",
      });
      setSelectedFile(null);
      setPreviewUrl("");

      // Call onSuccess callback and close modal after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="signup-modal-container fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4"
      style={{ pointerEvents: "auto" }}
    >
      <Card className="w-full max-w-4xl bg-gray-950 border-gray-800 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-gray-950 z-10 border-b border-gray-800">
          <CardTitle className="text-white text-xl font-mono">Sign Up</CardTitle>
          {(allowClose || success) && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="text-red-500 border border-red-500 rounded-full size-6"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-[#00daa2] text-lg font-mono mb-2">Success!</div>
              <div className="text-gray-300 text-sm font-mono">
                Your account has been created successfully.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-12 sm:space-y-16">
                {/* Profile Section */}
                <div>
                  <h2 className="text-base/7 font-semibold text-white font-mono">Profile</h2>
                  <p className="mt-1 max-w-2xl text-sm/6 text-gray-400 font-mono">
                    This information will be displayed publicly so be careful what you share.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-white/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-white/10 sm:border-t sm:border-t-white/10 sm:pb-0">
                    {/* Username */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="username"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        Username
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="janesmith"
                          value={formData.username}
                          onChange={(e) => handleInputChange("username", e.target.value)}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00daa2] sm:max-w-md sm:text-sm/6 font-mono"
                          required
                        />
                        <p className="mt-3 text-sm/6 text-gray-400 font-mono">
                          3-20 characters, letters, numbers, and underscores only
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="bio"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        About
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={3}
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00daa2] sm:max-w-2xl sm:text-sm/6 font-mono resize-none"
                        />
                        <p className="mt-3 text-sm/6 text-gray-400 font-mono">
                          Write a few sentences about yourself (max 500 characters).
                        </p>
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6">
                      <label
                        htmlFor="photo"
                        className="block text-sm/6 font-medium text-white font-mono"
                      >
                        Photo
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center gap-x-3">
                          {previewUrl ? (
                            <div className="relative size-12 rounded-full overflow-hidden border-2 border-[#00daa2]">
                              <Image
                                src={previewUrl}
                                alt="Profile Preview"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin text-[#00daa2]" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <User aria-hidden="true" className="size-12 text-gray-500" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileSelect(file);
                                  handleInputChange("profileImage", "temp-upload");
                                }
                              }}
                              className="hidden"
                              id="profile-image-upload"
                              disabled={isUploading}
                              required
                            />
                            <label
                              htmlFor="profile-image-upload"
                              className={`cursor-pointer rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/5 hover:bg-white/20 dark:shadow-none font-mono ${
                                isUploading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {isUploading ? `Uploading... ${uploadProgress}%` : "Change"}
                            </label>
                          </div>
                        </div>
                        <p className="mt-3 text-sm/6 text-gray-400 font-mono">
                          Upload a profile picture. Images will be stored on IPFS. (Required)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div>
                  <h2 className="text-base/7 font-semibold text-white font-mono">
                    Personal Information
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm/6 text-gray-400 font-mono">
                    Use a permanent address where you can receive mail.
                  </p>

                  <div className="mt-10 space-y-8 border-b border-white/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-white/10 sm:border-t sm:border-t-white/10 sm:pb-0">
                    {/* First Name */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="first-name"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        First name
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          id="first-name"
                          name="first-name"
                          type="text"
                          autoComplete="given-name"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:-outline-offset-2 focus:outline-[#00daa2] sm:max-w-xs sm:text-sm/6 font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="last-name"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        Last name
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          id="last-name"
                          name="last-name"
                          type="text"
                          autoComplete="family-name"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00daa2] sm:max-w-xs sm:text-sm/6 font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="email"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        Email address
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#00daa2] sm:max-w-md sm:text-sm/6 font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* X/Twitter Handle */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label
                        htmlFor="x-handle"
                        className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono"
                      >
                        X/Twitter Handle
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        <div className="flex items-center rounded-md bg-white/5 pl-3 outline -outline-offset-1 outline-white/10 focus-within:outline focus-within:-outline-offset-2 focus-within:outline-[#00daa2] sm:max-w-md">
                          <div className="shrink-0 select-none text-base text-gray-400 sm:text-sm/6 font-mono">
                            @
                          </div>
                          <input
                            id="x-handle"
                            name="x-handle"
                            type="text"
                            placeholder="yourhandle"
                            value={formData.xHandle}
                            onChange={(e) => handleInputChange("xHandle", e.target.value)}
                            className="block min-w-0 grow bg-transparent py-1.5 pl-1 pr-3 text-base text-white placeholder:text-gray-500 focus:outline sm:text-sm/6 font-mono"
                          />
                        </div>
                        <p className="mt-3 text-sm/6 text-gray-400 font-mono">Optional</p>
                      </div>
                    </div>

                    {/* Wallet Connection */}
                    <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                      <label className="block text-sm/6 font-medium text-white sm:pt-1.5 font-mono">
                        Wallet
                      </label>
                      <div className="mt-2 sm:col-span-2 sm:mt-0">
                        {address ? (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-[#00daa2] rounded-full"></div>
                            <div>
                              <div className="text-[#00daa2] text-sm font-mono font-medium">
                                Connected
                              </div>
                              <div className="text-gray-400 text-xs font-mono">
                                {address.slice(0, 6)}...{address.slice(-4)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ConnectButton />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className="mt-6 text-red-400 text-sm font-mono">{error}</div>}

              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end gap-x-6">
                {allowClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-sm/6 font-semibold text-gray-400 hover:text-white font-mono"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading || isUploading}
                  className="inline-flex justify-center rounded-md bg-[#00daa2] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#00b894] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#00daa2] disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-6 border-t border-white/10">
            <span className="text-gray-400 text-sm font-mono">Already have an account? </span>
            <button
              onClick={onSwitchToSignin}
              className="text-[#00daa2] hover:text-[#00b894] text-sm font-medium font-mono"
            >
              Sign In
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
