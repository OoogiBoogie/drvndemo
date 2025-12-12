"use client";

import { ConnectWallet, Wallet } from "@coinbase/onchainkit/wallet";
import { Name, Identity } from "@coinbase/onchainkit/identity";
import { FaTimes, FaCopy, FaNetworkWired } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useClientMounted } from "../../../hooks/useClientMount";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";

interface ConnectButtonProps {
  variant?: "default" | "modal" | "sidebar";
}

export const ConnectButton = (
  { variant = "default" }: ConnectButtonProps = { variant: "default" }
) => {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const mounted = useClientMounted();
  const [showDetails, setShowDetails] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isModalVariant = variant === "modal";
  const isSidebarVariant = variant === "sidebar";

  // We'll use OnchainKit Identity component with controlled styling

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDetails(false);
    } catch (error) {
      console.error("Failed to disconnect", error);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address", error);
    }
  };

  const getNetworkIcon = (chainId?: number) => {
    switch (chainId) {
      case 8453: // Base Mainnet
        return (
          <Image
            src="/baseLogo.jpg"
            alt="Base"
            width={20}
            height={20}
            className="object-contain rounded-md"
          />
        );
      default:
        return <FaNetworkWired className="w-5 h-5 text-[#00daa2]" />;
    }
  };

  const getNetworkName = (chainId?: number) => {
    switch (chainId) {
      case 8453:
        return "Base";
      default:
        return "Unknown Network";
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex justify-center" ref={dropdownRef}>
      {!address ? (
        // Show ConnectWallet when not connected
        <Wallet className="z-10 w-full">
          {isModalVariant ? (
            // Modal variant - Unique pill-shaped style with shimmer effect
            <div className="connect-wallet-modal-btn w-full relative group">
              <div className="relative bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300 overflow-hidden">
                <ConnectWallet
                  className="relative flex items-center justify-center w-full h-12 font-mono overflow-hidden"
                  disconnectedLabel={
                    <span className="text-white text-sm font-sans font-semibold uppercase tracking-wider relative z-10 flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Connect Wallet
                    </span>
                  }
                />
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          ) : (
            <ConnectWallet
              className={`drvn-wallet-btn relative flex items-center justify-center w-full h-12 rounded-md border border-[#00daa2] bg-transparent hover:bg-transparent font-mono ${
                isSidebarVariant ? "sidebar-connect-btn" : ""
              }`}
              disconnectedLabel={
                <span className={`text-sm font-sans ${isSidebarVariant ? "text-[#00daa2]" : "text-white"}`}>
                  Connect Wallet
                </span>
              }
            />
          )}
        </Wallet>
      ) : (
        // Show custom connected state when connected - Sleek with angled borders
        <div className="flex justify-center items-center w-full">
          <button
            onClick={() => setShowDetails(true)}
            className={`connected-wallet-btn w-full relative flex items-center justify-center px-3 py-2 border border-white/20 font-sans text-sm overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer ${
              isSidebarVariant ? "text-[#00daa2]" : "text-white"
            }`}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

            {/* Button Content */}
            <div className="relative z-10 flex-1 min-w-0 text-center">
              <Identity className={`font-sans text-sm bg-transparent truncate ${
                isSidebarVariant ? "text-[#00daa2]" : "text-white"
              }`}>
                <Name className={`font-sans text-sm bg-transparent truncate ${
                  isSidebarVariant ? "text-[#00daa2]" : "text-white"
                }`} />
              </Identity>
            </div>
          </button>
        </div>
      )}

      {/* Custom DRVN Disconnect Modal - Sleek Professional Design */}
      {showDetails && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

          {/* Modal Content - Professional Car Group Style */}
          <div
            className="relative w-full max-w-md bg-gray-950 rounded-lg border border-white/10 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-mono text-lg font-semibold tracking-wide">
                    Wallet Connection
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-400 text-xs font-sans">Address:</span>
                    <Identity className="text-gray-300 text-xs font-mono bg-transparent inline">
                      <Name className="text-gray-300 text-xs font-mono bg-transparent" />
                    </Identity>
                    <button
                      onClick={copyAddress}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                      title="Copy address"
                    >
                      <FaCopy className={`text-xs ${isCopied ? "text-white" : ""}`} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Network Status */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-gray-400 text-xs font-sans uppercase tracking-wide">
                  Network
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/10">
                  {getNetworkIcon(chain?.id)}
                  <span className="text-white font-mono text-sm font-medium">
                    {getNetworkName(chain?.id)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wide">
                      Status
                    </span>
                  </div>
                  <div className="text-white font-sans text-sm font-medium">Connected</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FaNetworkWired className="text-gray-400 text-xs" />
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wide">
                      Chain
                    </span>
                  </div>
                  <div className="text-white font-sans text-sm font-medium">
                    {getNetworkName(chain?.id)}
                  </div>
                </div>
              </div>

              {/* Disconnect Button - Sleek with Angled Borders and Shimmer */}
              <button
                onClick={handleDisconnect}
                className="disconnect-btn w-full relative flex items-center justify-center gap-2 py-3.5 px-4 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Button Content */}
                <div className="relative flex items-center gap-2 z-10">
                  <FaTimes className="text-sm" />
                  <span>Disconnect Wallet</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                .drvn-wallet-btn {
                    box-shadow: 0 0 10px rgba(0, 218, 162, 0.2);
                }
                .drvn-wallet-btn:hover {
                    box-shadow: 0 0 20px rgba(0, 218, 162, 0.4);
                }

                /* Disconnect Button - Angled Borders (Left in, Right out) */
                .disconnect-btn {
                    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
                    position: relative;
                }

                /* Override OnchainKit Identity styling to match our design */
                .drvn-wallet-btn .ock-text-foreground,
                .drvn-wallet-btn .ock-text-inverse,
                .drvn-wallet-btn [data-testid*="ock"],
                .drvn-wallet-btn .ock-identity,
                .drvn-wallet-btn .ock-name {
                    color: #ffffff !important;
                    background: transparent !important;
                    font-family: "Monospace", sans-serif !important;
                    font-size: 0.875rem !important;
                    line-height: 1.25rem !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                /* Fix disconnect modal black background and ensure inline display */
                .drvn-wallet-btn .ock-identity,
                .drvn-wallet-btn .ock-name,
                .drvn-wallet-btn [data-testid*="ockIdentity"],
                .drvn-wallet-btn [data-testid*="ockName"] {
                    background: transparent !important;
                    background-color: transparent !important;
                    display: inline !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    outline: none !important;
                }

                /* Remove any child element styling that might cause black squares */
                .drvn-wallet-btn .ock-identity > *,
                .drvn-wallet-btn .ock-name > *,
                .drvn-wallet-btn [data-testid*="ockIdentity"] > *,
                .drvn-wallet-btn [data-testid*="ockName"] > * {
                    background: transparent !important;
                    background-color: transparent !important;
                    display: inline !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    outline: none !important;
                }

                /* Force all OnchainKit elements to have transparent backgrounds */
                .drvn-wallet-btn [class*="mini-app"],
                .drvn-wallet-btn [class*="mini-app"] *,
                .drvn-wallet-btn [data-testid*="mini-app"],
                .drvn-wallet-btn [data-testid*="mini-app"] * {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                }

                /* Target specific OnchainKit component classes */
                .drvn-wallet-btn .mini-app-identity,
                .drvn-wallet-btn .mini-app-name,
                .drvn-wallet-btn [class*="mini-app-identity"],
                .drvn-wallet-btn [class*="mini-app-name"] {
                    background: transparent !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                }

                /* Sidebar variant - Green text color */
                .sidebar-connect-btn .ock-text-foreground,
                .sidebar-connect-btn .ock-text-inverse,
                .sidebar-connect-btn [data-testid*="ock"],
                .sidebar-connect-btn .ock-identity,
                .sidebar-connect-btn .ock-name,
                .sidebar-connect-btn .mini-app-identity,
                .sidebar-connect-btn .mini-app-name {
                    color: #00daa2 !important;
                }
            `}</style>
    </div>
  );
};
