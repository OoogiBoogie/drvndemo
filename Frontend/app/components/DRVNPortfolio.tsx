/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAccount, useBalance, useReadContract } from "wagmi";
import { TokenChip, formatAmount } from "@coinbase/onchainkit/token";
import { DRVN_TOKENS } from "../swap/types/swap-types";
import { Car, Vault } from "lucide-react";
import { formatUnits } from "viem";
import deployedContracts from "../../contracts/deployedContracts";
import Image from "next/image";
import ETHPriceDisplay from "../../service/priceService";

/**
 * User interface representing the structure of user data
 * This matches the MongoDB schema and API responses
 * Note: This interface is duplicated from Settings.tsx - consider moving to a shared types file
 */
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  xHandle?: string;
  profileImage?: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Props interface for the DRVNPortfolio component
 * @param currentUser - The currently authenticated user's data
 * @param isAuthenticated - Boolean indicating if user is authenticated
 * @param onNavigate - Optional navigation handler
 * @param miniAppUser - Mini app user data (Farcaster/Base)
 * @param isInMiniApp - Boolean indicating if user is in mini app
 * @param getProfileImage - Function to get profile image URL
 * @param getDisplayUsername - Function to get display username
 * @param getDisplayName - Function to get display name
 */
interface DRVNPortfolioProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  onNavigate?: (page: string) => void;
  isInMiniApp?: boolean;
  getProfileImage?: () => string;
  getDisplayUsername?: () => string;
  getDisplayName?: () => string | null;
}

/**
 * DRVN Portfolio Component
 *
 * This component displays a user's DRVN ecosystem portfolio including:
 * - BSTR (DRVN ecosystem token) balance - 9 decimals (real-time from blockchain)
 * - Car Collection balance - placeholder for future NFT collection data
 * - Vault Balance - placeholder for future vault/staking data
 *
 * The component features:
 * - Real-time BSTR balance fetching using Wagmi hooks
 * - Placeholder displays for future features (Car Collection, Vault)
 * - Responsive grid layout for different screen sizes
 * - User identification display
 * - Animated visual indicators
 * - Consistent styling with DRVN brand colors
 *
 * Authentication Requirements:
 * - Wallet must be connected
 * - User must be authenticated
 * - Current user data must be available
 */
export function DRVNPortfolio({
  currentUser,
  isAuthenticated,
  onNavigate,
  isInMiniApp,
  getProfileImage,
  getDisplayUsername,
  getDisplayName,
}: DRVNPortfolioProps) {
  // Wagmi hook to get connected wallet information
  const { address, isConnected } = useAccount();

  // Contract addresses for vault assets
  const usdcConfig = deployedContracts[8453].USDC;
  const usdcAddress = usdcConfig.address as `0x${string}`;

  // Token balance fetching using Wagmi's useBalance hook
  // BSTR token balance - DRVN ecosystem token
  const { data: bstrBalance } = useBalance({
    address,
    token: DRVN_TOKENS.BSTR.address as `0x${string}`,
  });

  // Vault asset balances - USDC and ETH
  const { data: usdcBalanceData } = useReadContract({
    address: usdcAddress,
    abi: usdcConfig.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  const { data: ethBalanceData } = useBalance({
    address: address,
    query: {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Early return if wallet not connected or user not authenticated
  // This prevents the component from rendering without proper authentication
  if (!isConnected || !isAuthenticated || !currentUser) {
    return null;
  }

  // Calculate vault values
  const usdcBalance = usdcBalanceData ? formatUnits(usdcBalanceData as unknown as bigint, 6) : "0";
  const ethBalance = ethBalanceData ? formatUnits(ethBalanceData.value, 18) : "0";

  // For demo purposes, assuming 1 ETH = $3000 (you can integrate with a price API later)
  const ethPrice = 3000;
  const ethValue = parseFloat(ethBalance) * ethPrice;
  const usdcValue = parseFloat(usdcBalance);
  const totalVaultValue = (ethValue + usdcValue).toFixed(2);

  /**
   * Helper function to format token balances using OnChainKit's formatAmount
   * Applies the correct decimal precision for each token type
   * BSTR is limited to 4 decimal places for better readability
   * @param balance - The balance data from Wagmi useBalance hook
   * @param decimals - The number of decimals for the specific token
   * @returns Formatted balance string with proper decimal precision
   */
  const formatBalance = (balance: any, decimals: number) => {
    if (!balance?.formatted) return "0.00";

    // For BSTR token, limit to 4 decimal places for better readability
    const maxDecimals = decimals === 9 ? 4 : Math.min(decimals, 4);

    // Use OnChainKit's formatAmount for consistent formatting
    // This handles locale-specific formatting and proper decimal precision
    return formatAmount(balance.formatted, {
      minimumFractionDigits: Math.min(maxDecimals, 2), // Show at least 2 decimals
      maximumFractionDigits: maxDecimals, // Limit to 4 decimals for BSTR
    });
  };

  // Portfolio stats data - matching the example structure
  const portfolioStats = [
    {
      name: "BSTR",
      value: formatBalance(bstrBalance, DRVN_TOKENS.BSTR.decimals),
      onClick: () => onNavigate?.("buster-club"),
      icon: <TokenChip token={DRVN_TOKENS.BSTR} />,
    },
    {
      name: "Car Collection",
      value: "0",
      onClick: () => onNavigate?.("garage"),
      icon: (
        <div className="w-6 h-6 bg-gray-950 rounded-lg flex items-center justify-center">
          <Car className="w-4 h-4 text-white" />
        </div>
      ),
    },
    {
      name: "Vault Balance",
      value: `$${parseFloat(totalVaultValue).toLocaleString()}`,
      onClick: () => onNavigate?.("garage"),
      icon: (
        <div className="w-6 h-6 bg-gray-950 rounded-lg flex items-center justify-center">
          <Vault className="w-4 h-4 text-white" />
        </div>
      ),
      breakdown: (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Image
                src="/Cars/usdc.png"
                alt="USDC"
                width={12}
                height={12}
                className="w-3 h-3 rounded-full"
              />
              <span className="text-gray-400">USDC</span>
            </div>
            <span className="text-gray-300 font-mono">
              ${parseFloat(usdcBalance).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Image
                src="/Cars/base-logo.png"
                alt="Base ETH"
                width={12}
                height={12}
                className="w-3 h-3 rounded-full"
              />
              <span className="text-gray-400">ETH</span>
            </div>
            <div className="text-right">
              <div className="text-gray-300 font-mono">{parseFloat(ethBalance).toFixed(4)}</div>
              {parseFloat(ethBalance) > 0 && (
                <ETHPriceDisplay
                  ethAmount={ethBalance}
                  className="text-xs text-green-400 font-mono"
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Portfolio Title with Animated Indicator */}
      <div className="text-white font-mono text-lg flex items-center justify-between gap-4 uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00daa2] rounded-full animate-pulse"></div>
          Portfolio
        </div>
        {/* User Profile Info - Only show on mini apps */}
        {isInMiniApp && getProfileImage && getDisplayUsername && getDisplayName && (
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray-50 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 overflow-hidden">
              <Image
                src={getProfileImage()}
                alt="Profile"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-semibold text-white truncate font-mono">
                @{getDisplayUsername()}
              </div>
              {getDisplayName() && (
                <div className="text-xs text-gray-400 truncate font-sans">{getDisplayName()}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Stats Grid - Matching Tailwind UI example style exactly */}
      <dl className="mx-auto max-w-8xl grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3 rounded-lg overflow-hidden border border-white/20">
        {portfolioStats.map((stat) => (
          <div
            key={stat.name}
            onClick={stat.onClick}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-gray-950 px-2 py-2 sm:px-6 xl:px-8 cursor-pointer hover:bg-gray-900 transition-all duration-200"
          >
            <dt className="text-sm/6 font-medium text-gray-400 flex items-center gap-2">
              {stat.icon}
              {stat.name}
            </dt>
            <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-white font-mono">
              {stat.value}
            </dd>
            {stat.breakdown && (
              <div className="w-full mt-2 rounded-md bg-gray-950/50 p-2 border border-white/20">
                {stat.breakdown}
              </div>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
