"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Car, Wrench, Settings, Key, Home } from "lucide-react";
import { SignupModal } from "./signup-modal";
import { SigninModal } from "./signin-modal";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { ConnectButton } from "../web3/ConnectButton";

interface WalletFirstAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WalletFirstAuthModal({ isOpen, onClose, onSuccess }: WalletFirstAuthModalProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAutoSigningIn, setIsAutoSigningIn] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [selectedAction, setSelectedAction] = useState<"signup" | "signin" | null>(null);

  // Check if user exists when wallet connects - only if user selected an action
  useEffect(() => {
    const checkUserExists = async () => {
      if (address && isConnected && isOpen && userExists === null && selectedAction) {
        setIsChecking(true);
        try {
          // First, check if user exists
          const checkResponse = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: address }),
          });

          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            setUserExists(checkData.exists);

            // If user has an existing account, automatically sign them in
            if (checkData.exists) {
              setIsChecking(false);
              setIsAutoSigningIn(true);
              try {
                // Auto-sign in the user
                const signinResponse = await fetch("/api/auth/signin", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    walletAddress: address,
                  }),
                });

                const signinData = await signinResponse.json();

                if (signinResponse.ok) {
                  // Successfully signed in - close modal and trigger success
                  setIsAutoSigningIn(false);
                  onSuccess();
                  onClose();
                  return;
                } else {
                  // Signin failed, show error but still allow manual signin
                  console.error("Auto-signin failed:", signinData.error);
                  setIsAutoSigningIn(false);
                  setShowSigninModal(true);
                }
              } catch (signinError) {
                console.error("Error during auto-signin:", signinError);
                // Fallback to showing signin modal
                setIsAutoSigningIn(false);
                setShowSigninModal(true);
              }
            } else {
              // If no account exists and user selected signup, show signup modal
              if (selectedAction === "signup") {
                setUserExists(false);
                setIsChecking(false);
                setShowSignupModal(true);
              }
              // If no account exists and user selected signin, show error and disconnect
              else if (selectedAction === "signin") {
                disconnect();
                setUserExists(null);
                setSelectedAction(null);
                setIsChecking(false);
                alert("No account found for this wallet address. Please create a new account.");
                return;
              }
            }
          } else {
            // Error checking, default to signup if that was selected
            setUserExists(false);
            setIsChecking(false);
            if (selectedAction === "signup") {
              setShowSignupModal(true);
            } else {
              disconnect();
              setSelectedAction(null);
              alert("Unable to verify account. Please try again.");
            }
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          setUserExists(false);
          setIsChecking(false);
          if (selectedAction === "signup") {
            setShowSignupModal(true);
          } else {
            disconnect();
            setSelectedAction(null);
            alert("Unable to verify account. Please try again.");
          }
        }
      }
    };

    checkUserExists();
  }, [address, isConnected, isOpen, userExists, selectedAction, onSuccess, onClose, disconnect]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserExists(null);
      setIsChecking(false);
      setIsAutoSigningIn(false);
      setShowSignupModal(false);
      setShowSigninModal(false);
      setSelectedAction(null);
    }
  }, [isOpen]);

  const handleSignupClick = () => {
    setSelectedAction("signup");
    // Don't show modal yet - wait for wallet connection
  };

  const handleSigninClick = () => {
    setSelectedAction("signin");
    // Don't show modal yet - wait for wallet connection
  };

  const handleSignupClose = () => {
    setShowSignupModal(false);
    setUserExists(null);
    setSelectedAction(null);
    // Disconnect wallet if signup is cancelled
    if (isConnected) {
      disconnect();
    }
    onClose();
  };

  const handleSigninClose = () => {
    setShowSigninModal(false);
    setUserExists(null);
    setSelectedAction(null);
    // Disconnect wallet if signin is cancelled
    if (isConnected) {
      disconnect();
    }
    onClose();
  };

  const handleSignupSuccess = () => {
    // Only call onSuccess after successful signup - this connects them to the site
    onSuccess();
    setShowSignupModal(false);
    setUserExists(null);
    setSelectedAction(null);
    onClose();
  };

  const handleSigninSuccess = () => {
    onSuccess();
    setShowSigninModal(false);
    setUserExists(null);
    setSelectedAction(null);
    onClose();
  };

  if (!isOpen) return null;

  // If checking user existence or auto-signing in, show loading state
  if (isChecking || isAutoSigningIn) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <Card className="w-full max-w-md bg-gradient-to-b from-gray-900 to-black border-2 border-[#00daa2]/30 shadow-2xl shadow-[#00daa2]/20">
          <CardContent className="space-y-6 text-center py-8">
            {/* Garage door loading animation */}
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00daa2]/20 border-t-[#00daa2] mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-2 border-[#00daa2]/10 animate-ping"></div>
            </div>
            <p className="text-[#00daa2] text-sm font-mono font-bold tracking-wide">
              {isAutoSigningIn
                ? "🔓 UNLOCKING YOUR GARAGE..."
                : "🔧 SCANNING GARAGE ACCESS CREDENTIALS..."}
            </p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-[#00daa2] rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-[#00daa2] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#00daa2] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If signup or signin modals are showing, render them
  if (showSignupModal || showSigninModal) {
    return (
      <>
        {/* Signup Modal */}
        <SignupModal
          isOpen={showSignupModal}
          onClose={handleSignupClose}
          onSwitchToSignin={() => {
            setShowSignupModal(false);
            setShowSigninModal(true);
          }}
          onSuccess={handleSignupSuccess}
          allowClose={false} // Don't allow closing until signup is complete
        />

        {/* Signin Modal */}
        <SigninModal
          isOpen={showSigninModal}
          onClose={handleSigninClose}
          onSwitchToSignup={() => {
            setShowSigninModal(false);
            setShowSignupModal(true);
          }}
          onSuccess={handleSigninSuccess}
        />
      </>
    );
  }

  // If wallet is not connected, show the choice modal with wallet connection
  if (!address) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        {/* Garage Door Effect */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-900 via-black to-black opacity-60"></div>

        <Card className="w-full max-w-lg bg-linear-to-b from-gray-900 to-black border border-white/50 relative overflow-hidden">
          {/* Close Button */}
          <div className="flex flex-row justify-end mt-4 mr-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 hover:scale-110 transition-transform"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <CardHeader className="flex items-center justify-center space-y-0 pb-0">
            <CardTitle className="text-[#00daa2] text-center text-2xl font-mono mb-2 -mt-5">
              GARAGE ACCESS
            </CardTitle>
          </CardHeader>

          {/* Logo with garage styling */}
          <div className="flex justify-center mb-4 relative">
            <div className="relative">
              <Image
                src="/Cars/DRVNWHITE.png"
                alt="DRVN VHCLS"
                width={100}
                height={100}
                className="mx-auto w-auto h-auto"
              />
            </div>
          </div>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm font-sans mb-6 tracking-wide">
                Welcome to the home of onchain car culture!
              </p>
            </div>

            <div className="space-y-4">
              {/* Create Account - Styled like a garage key */}
              <Button
                onClick={handleSignupClick}
                className="w-full bg-linear-to-r from-[#00daa2] to-[#00b894] text-black hover:from-[#00b894] hover:to-[#00daa2] font-bold font-mono h-10 text-lg shadow-lg shadow-[#00daa2]/30 transition-all duration-300 border-2 border-[#00daa2]/50 hover:border-[#00daa2] hover:scale-[1.02]"
              >
                <Home className="h-5 w-5 mr-3" />
                Create New Garage
              </Button>

              {/* Sign In - Styled like a garage access card */}
              <Button
                onClick={handleSigninClick}
                variant="outline"
                className="w-full border-2 border-[#00daa2] text-[#00daa2] bg-transparent font-bold font-mono h-10 text-lg transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#00daa2]/20"
              >
                <Key className="h-5 w-5 mr-3" />
                Unlock Your Garage
              </Button>
            </div>

            {/* Wallet Connection Section - Styled like a garage security system */}
            {selectedAction && (
              <div className="space-y-4 pt-6 border-t-2 border-[#00daa2]/30">
                <div className="text-center">
                  <p className="text-[#00daa2] text-sm font-mono font-bold">
                    {selectedAction === "signup"
                      ? "🔧 Connect or Create New Wallet to Unlock Your Garage"
                      : "🔐 Login to Your Existing Garage"}
                  </p>
                </div>

                <div>
                  <ConnectButton />
                </div>
              </div>
            )}

            {/* Footer - Garage mechanic style */}
            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs font-sans tracking-wide">
                <span className="text-[#00daa2] font-bold">CONNECT</span> your wallet to access your{" "}
                <span className="text-[#00daa2] font-bold">AUTOMOTIVE WORKSHOP</span>
              </p>
              <div className="flex justify-center mt-2 space-x-2">
                <Car className="h-4 w-4 text-[#00daa2]" />
                <Wrench className="h-4 w-4 text-[#00daa2]" />
                <Settings className="h-4 w-4 text-[#00daa2]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main wallet connection modal (should not reach here if flow is correct)
  return null;
}
