"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { X, Key, Home, Settings, CheckCircle2 } from "lucide-react";
import { SignupModal } from "./signup-modal";
import { SigninModal } from "./signin-modal";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { ConnectButton } from "../web3/ConnectButton";

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthChoiceModal({ isOpen, onClose, onSuccess }: AuthChoiceModalProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"signup" | "signin" | null>(null);
  const [verificationStep, setVerificationStep] = useState(0);

  // Check if user exists when wallet connects
  useEffect(() => {
    const checkUserExists = async () => {
      if (address && isOpen && userExists === null) {
        setIsChecking(true);
        setVerificationStep(0); // Start with step 0

        // Step 1: Verifying Connected Wallet
        setTimeout(() => setVerificationStep(1), 800);

        try {
          // Step 2: Collecting profile information
          setTimeout(() => setVerificationStep(2), 1600);

          const response = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: address }),
          });

          if (response.ok) {
            const data = await response.json();
            setUserExists(data.exists);

            // Step 3: Connecting (with delay to show the step)
            setTimeout(() => {
              setVerificationStep(3);

              // If user has an existing account, automatically sign them in
              if (data.exists) {
                // Wait a bit for step 3 to show, then complete
                setTimeout(() => {
                  setIsChecking(false);
                  onSuccess();
                  onClose();
                }, 500);
              }
            }, 800);

            // If user has an existing account, return early (handled in setTimeout above)
            if (data.exists) {
              return;
            }

            // If no account exists and user selected signup, show signup modal
            if (selectedAction === "signup") {
              setIsChecking(false);
              setShowSignupModal(true);
            }
            // If no account exists and user selected signin, show error and disconnect
            else if (selectedAction === "signin") {
              setIsChecking(false);
              disconnect();
              setUserExists(null);
              setSelectedAction(null);
              alert("No account found for this wallet address. Please create a new account.");
              return;
            }
            // If no action selected yet and no account exists, show signup modal
            else if (!selectedAction) {
              setIsChecking(false);
              setShowSignupModal(true);
              setSelectedAction("signup");
            }
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          setUserExists(false); // Default to signup if error
          setIsChecking(false);
          if (selectedAction === "signin") {
            // Auto-disconnect wallet since we can't verify
            disconnect();
            setUserExists(null);
            setSelectedAction(null);
            alert("Unable to verify account. Please try again.");
          } else {
            setShowSignupModal(true);
          }
        }
      }
    };

    checkUserExists();
  }, [address, isOpen, userExists, selectedAction, disconnect, onSuccess, onClose]);

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
    setUserExists(null); // Reset for next time
    setSelectedAction(null);
    // Disconnect wallet if signup is cancelled
    if (address) {
      disconnect();
    }
    onClose();
  };

  const handleSigninClose = () => {
    setShowSigninModal(false);
    setUserExists(null); // Reset for next time
    setSelectedAction(null);
    // Disconnect wallet if signin is cancelled
    if (address) {
      disconnect();
    }
    onClose();
  };

  const handleSignupSuccess = () => {
    // Close signup modal first
    setShowSignupModal(false);
    setUserExists(null);
    setSelectedAction(null);
    // Close the auth-choice-modal
    onClose();
    // Connect user to site
    onSuccess();
  };

  const handleSigninSuccess = () => {
    // Close signin modal first
    setShowSigninModal(false);
    setUserExists(null);
    setSelectedAction(null);
    // Close the auth-choice-modal
    onClose();
    // Connect user to site
    onSuccess();
  };

  // If wallet is not connected, show the choice modal with wallet connection
  if (!address) {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4"
        onClick={onClose}
      >
        {/* Modal Content - Professional Sleek Design */}
        <Card
          className="w-full max-w-md bg-gray-950 rounded-lg border border-white/10 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-mono text-lg font-semibold tracking-wide">
                  Garage Access
                </h3>
                <p className="text-gray-400 text-xs font-sans mt-1">
                  Welcome to onchain car culture
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="text-sm" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mt-4">
              <Image
                src="/Cars/DRVNWHITE.png"
                alt="DRVN VHCLS"
                width={80}
                height={80}
                className="w-auto h-auto opacity-90"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {/* Create New Garage Button - Professional with Angled Borders */}
              <button
                onClick={handleSignupClick}
                className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Accent Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-[#00daa2]/20 via-transparent to-[#00daa2]/20 opacity-50"></div>

                {/* Button Content */}
                <div className="relative flex items-center gap-2 z-10">
                  <Home className="text-sm group-hover:scale-110 transition-transform duration-300" />
                  <span>Create New Garage</span>
                </div>
              </button>

              {/* Unlock Your Garage Button - Professional with Angled Borders */}
              <button
                onClick={handleSigninClick}
                className="auth-choice-btn-secondary w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-gray-950 via-black to-gray-950 border border-blue-500/50 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-blue-400 transition-all duration-300 cursor-pointer"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-blue-500/20 to-transparent"></div>

                {/* Purple Accent Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-[#8351a1]/20 via-transparent to-[#8351a1]/20 opacity-50"></div>

                {/* Button Content */}
                <div className="relative flex items-center gap-2 z-10">
                  <Key className="text-sm group-hover:scale-110 transition-transform duration-300" />
                  <span>Unlock Your Garage</span>
                </div>
              </button>
            </div>

            {/* Wallet Connection Section */}
            {selectedAction && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-sans uppercase tracking-wide mb-3">
                    {selectedAction === "signup"
                      ? "Connect or Create New Wallet"
                      : "Login to Your Existing Garage"}
                  </p>
                </div>

                <div>
                  <ConnectButton variant="modal" />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/5">
              <p className="text-gray-500 text-xs font-sans tracking-wide">
                Connect your wallet to access your automotive workshop
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Verification steps
  const verificationSteps = [
    { name: "Verifying Connected Wallet", status: "upcoming" },
    { name: "Collecting profile information", status: "upcoming" },
    { name: "Connecting", status: "upcoming" },
  ];

  // Update step statuses based on current step
  const getStepStatus = (index: number) => {
    if (index < verificationStep) return "complete";
    if (index === verificationStep) return "current";
    return "upcoming";
  };

  // If wallet is connected but we're still checking, show step-by-step verification
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <Card className="w-full max-w-md bg-gray-950 rounded-lg border border-white/10 overflow-hidden shadow-2xl">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <h3 className="text-white font-mono text-lg font-semibold tracking-wide">
                Unlocking Your Garage
              </h3>
            </div>

            <nav aria-label="Progress" className="flex justify-center">
              <ol role="list" className="space-y-6 w-full">
                {verificationSteps.map((step, index) => {
                  const status = getStepStatus(index);
                  const isCurrent = status === "current";
                  const isComplete = status === "complete";

                  return (
                    <li key={step.name}>
                      <div className="flex items-start">
                        <span
                          aria-hidden="true"
                          className="relative flex size-6 shrink-0 items-center justify-center"
                        >
                          {isComplete ? (
                            <CheckCircle2 className="size-6 text-white" />
                          ) : isCurrent ? (
                            <div className="relative">
                              <span className="absolute size-5 rounded-full bg-white/20 animate-pulse" />
                              <Settings className="size-5 text-white animate-spin relative z-10" />
                            </div>
                          ) : (
                            <div className="size-2 rounded-full bg-white/15" />
                          )}
                        </span>
                        <span
                          className={`ml-4 text-sm font-medium ${
                            isCurrent
                              ? "text-white"
                              : isComplete
                                ? "text-gray-400"
                                : "text-gray-500"
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If wallet is connected and we know the user status, show appropriate modal
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
