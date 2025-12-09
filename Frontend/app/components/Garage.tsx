/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits } from "viem";
// import { Card, CardContent } from "./ui/card";
import {
  Car,
  TrendingUp,
  ChevronDown,
  Coins,
  Key,
  ArrowRight,
  //   Trophy,
} from "lucide-react";
import Image from "next/image";
import deployedContracts from "../../contracts/deployedContracts";
import ETHPriceDisplay from "../../service/priceService";
import { useState } from "react";
import { BusterSwapModal } from "./modals/token-swap-modal";
import { HeroHeader } from "./ui/hero-header";

// Type for the reward config tuple returned by the contract
type RewardConfig = [
  string, // bstr
  string, // vault
  boolean, // isContract
  bigint, // perUnit
  boolean, // enabled
  boolean, // onAirdrop
  boolean, // strict
];

/**
 * My NFT Keys Component
 * Displays user's owned NFT keys from all three DRVN collections
 */
function MyNFTKeys() {
  const { address, isConnected } = useAccount();

  // Contract addresses for the three collections
  const steelConfig = deployedContracts[8453].SteelBuster;
  const carbonConfig = deployedContracts[8453].CarbonBuster;
  const titaniumConfig = deployedContracts[8453].TitaniumBuster;

  // Read balances from all three contracts
  const { data: steelBalance } = useReadContract({
    address: steelConfig.address as `0x${string}`,
    abi: steelConfig.abi,
    functionName: "balanceOfKey",
    args: address ? [address] : undefined,
    query: { refetchInterval: 30000 },
  });

  const { data: carbonBalance } = useReadContract({
    address: carbonConfig.address as `0x${string}`,
    abi: carbonConfig.abi,
    functionName: "balanceOfKey",
    args: address ? [address] : undefined,
    query: { refetchInterval: 30000 },
  });

  const { data: titaniumBalance } = useReadContract({
    address: titaniumConfig.address as `0x${string}`,
    abi: titaniumConfig.abi,
    functionName: "balanceOfKey",
    args: address ? [address] : undefined,
    query: { refetchInterval: 30000 },
  });

  // Read reward configuration from contracts
  const { data: steelRewardConfig } = useReadContract({
    address: steelConfig.address as `0x${string}`,
    abi: steelConfig.abi,
    functionName: "rewardConfig",
    query: { refetchInterval: 30000 },
  });

  const { data: carbonRewardConfig } = useReadContract({
    address: carbonConfig.address as `0x${string}`,
    abi: carbonConfig.abi,
    functionName: "rewardConfig",
    query: { refetchInterval: 30000 },
  });

  const { data: titaniumRewardConfig } = useReadContract({
    address: titaniumConfig.address as `0x${string}`,
    abi: titaniumConfig.abi,
    functionName: "rewardConfig",
    query: { refetchInterval: 30000 },
  });

  // Calculate BSTR rewards (assuming 9 decimals for BSTR, displayed with 4 decimals)
  const calculateBSTRRewards = (balance: bigint | undefined, rewardPerUnit: bigint | undefined) => {
    if (!balance || !rewardPerUnit) return "0";
    const totalRewards = balance * rewardPerUnit;
    const formattedRewards = formatUnits(totalRewards, 9);
    // Limit to 4 decimal places for better readability
    const parts = formattedRewards.split(".");
    if (parts[1] && parts[1].length > 4) {
      return parts[0] + "." + parts[1].substring(0, 4);
    }
    return formattedRewards;
  };

  // Helper function to safely extract reward per unit from the tuple
  const getRewardPerUnit = (config: RewardConfig | undefined): bigint | undefined => {
    if (!config || !Array.isArray(config) || config.length < 4) return undefined;
    return config[3]; // perUnit is at index 3
  };

  // Extract reward per unit values from contract calls
  const steelPerUnit = getRewardPerUnit(steelRewardConfig as RewardConfig | undefined);
  const carbonPerUnit = getRewardPerUnit(carbonRewardConfig as RewardConfig | undefined);
  const titaniumPerUnit = getRewardPerUnit(titaniumRewardConfig as RewardConfig | undefined);

  // Ensure we have bigint values for the calculation
  const steelPerUnitBigInt =
    steelPerUnit && typeof steelPerUnit === "bigint" ? steelPerUnit : undefined;
  const carbonPerUnitBigInt =
    carbonPerUnit && typeof carbonPerUnit === "bigint" ? carbonPerUnit : undefined;
  const titaniumPerUnitBigInt =
    titaniumPerUnit && typeof titaniumPerUnit === "bigint" ? titaniumPerUnit : undefined;

  // Calculate rewards for each collection
  const steelRewards = calculateBSTRRewards(steelBalance as bigint | undefined, steelPerUnitBigInt);
  const carbonRewards = calculateBSTRRewards(
    carbonBalance as bigint | undefined,
    carbonPerUnitBigInt
  );
  const titaniumRewards = calculateBSTRRewards(
    titaniumBalance as bigint | undefined,
    titaniumPerUnitBigInt
  );

  // Total keys owned (commented out as not currently used)
  // const totalKeys = (Number(steelBalance || 0) + Number(carbonBalance || 0) + Number(titaniumBalance || 0));

  if (!isConnected) {
    return (
      <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
        <div className="p-6">
          <div className="text-center text-gray-400 font-mono">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-sm">Signin / Sign Up + Connect your wallet to view your NFT keys</p>
          </div>
        </div>
      </div>
    );
  }

  const keys = [
    {
      id: 1,
      name: "Steel",
      imageUrl: "/Cars/Steel.gif",
      balance: steelBalance ? Number(steelBalance) : 0,
      rewards: steelRewards,
      color: "from-gray-600 to-gray-700",
    },
    {
      id: 2,
      name: "Carbon",
      imageUrl: "/Cars/Carbon.gif",
      balance: carbonBalance ? Number(carbonBalance) : 0,
      rewards: carbonRewards,
      color: "from-green-600 to-green-700",
    },
    {
      id: 3,
      name: "Titanium",
      imageUrl: "/Cars/Titanium.gif",
      balance: titaniumBalance ? Number(titaniumBalance) : 0,
      rewards: titaniumRewards,
      color: "from-blue-600 to-blue-700",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white font-mono">Digital Collectibles</h2>
      </div>

      <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-3 xl:gap-x-8">
        {keys.map((key) => (
          <li
            key={key.id}
            className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950"
          >
            <div className="flex items-center gap-x-4 border-b border-white/10 bg-white/5 p-6">
              <div
                className={`size-12 flex-none rounded-lg bg-linear-to-r ${key.color} object-cover ring-1 ring-white/10 overflow-hidden`}
              >
                <Image
                  alt={key.name}
                  src={key.imageUrl}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm/6 font-semibold text-white font-mono">{key.name}</div>
                <div className="text-xs text-gray-400 font-mono mt-1">
                  {key.balance} {key.balance === 1 ? "Key" : "Keys"}
                </div>
              </div>
            </div>
            <dl className="-my-3 divide-y divide-white/10 px-6 py-4 text-sm/6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-400 font-mono">BSTR Rewards</dt>
                <dd className="font-medium text-white font-mono">
                  {parseFloat(key.rewards).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Garage Component
 *
 * This component displays the user's garage with:
 * - Hero image of the garage
 * - Vehicle Collection stats (static for now)
 * - Assets Vault with real-time wallet balances (USDC + Base ETH)
 * - My NFT Keys showing owned keys and BSTR rewards
 *
 * Features:
 * - Real-time wallet balance updates
 * - Professional garage aesthetic
 * - Responsive design
 */
interface GarageProps {
  currentUser: any;
  isAuthenticated: boolean;
}

export function Garage({ currentUser, isAuthenticated }: GarageProps) {
  const { address, isConnected } = useAccount();
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Contract addresses
  const usdcConfig = deployedContracts[8453].USDC;
  const usdcAddress = usdcConfig.address as `0x${string}`;

  // Fetch real wallet balances using wagmi hooks
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

  // Calculate total portfolio value
  const usdcBalance = usdcBalanceData ? formatUnits(usdcBalanceData as unknown as bigint, 6) : "0";
  const ethBalance = ethBalanceData ? formatUnits(ethBalanceData.value, 18) : "0";

  // For demo purposes, assuming 1 ETH = $3000 (you can integrate with a price API later)
  const ethPrice = 3000;
  const ethValue = parseFloat(ethBalance) * ethPrice;
  const usdcValue = parseFloat(usdcBalance);
  const totalValue = (ethValue + usdcValue).toFixed(2);

  // Get user profile image
  const getProfileImage = () => {
    if (currentUser?.profileImage) {
      return currentUser.profileImage;
    }
    return "/Cars/UserImage.png";
  };

  // Get display username
  const getDisplayUsername = () => {
    if (currentUser?.username) {
      return currentUser.username;
    }
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return "Garage Owner";
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero Banner Section */}
        <HeroHeader
          title="DRVN Garage"
          subtitle="Your personal collection of premium vehicles and digital assets"
          backgroundImage="/Cars/GarageV12.jpg"
        />

        {/* Vehicle Collection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicle Collection */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
              {/* Header with Profile Image - Inspired by Tailwind UI example */}
              <div className="border-b border-white/10 px-6 py-5">
                <div className="-mt-4 -ml-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                  <div className="mt-4 ml-4">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <Image
                          alt=""
                          src={getProfileImage()}
                          width={48}
                          height={48}
                          className="size-12 rounded-full bg-gray-50 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10 object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base font-semibold text-white font-mono">
                          Vehicle Collection
                        </h3>
                        <p className="text-sm text-gray-400 font-mono">@{getDisplayUsername()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 ml-4 flex shrink-0">
                    <button
                      type="button"
                      className="auth-choice-btn-primary relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white border border-white/20 overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                      <span className="relative z-10 font-mono">Marketplace</span>
                      <ArrowRight className="relative z-10 size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                {/* Summary Value */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white font-mono mb-1">$0</div>
                  <div className="text-lg text-[#00daa2] font-mono">0% 24hr</div>
                </div>

                {/* Stats Grid */}
                <dl className="-my-3 divide-y divide-white/10 text-sm/6">
                  {/* Cars Owned */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <Car className="w-5 h-5 text-white/60" />
                      Cars Owned
                    </dt>
                    <dd className="font-medium text-white font-mono">0</dd>
                  </div>

                  {/* 30 Day Performance */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <TrendingUp className="w-5 h-5 text-[#00daa2]" />
                      30 Day Performance
                    </dt>
                    <dd className="font-medium text-[#00daa2] font-mono">0%</dd>
                  </div>

                  {/* Collection List */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-3 text-gray-400 font-mono">
                      <Coins className="w-5 h-5 text-white/60" />
                      Collection List
                    </dt>
                    <dd>
                      <ChevronDown className="w-5 h-5 text-[#00daa2]" />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Right Column - Assets Vault */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
              <div className="px-6 py-5 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white font-mono">Assets Vault</h2>
              </div>

              <div className="px-6 py-5">
                {/* Total Value */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white font-mono mb-1">
                    {isConnected ? (
                      `$${parseFloat(totalValue).toLocaleString()}`
                    ) : (
                      <span className="text-gray-400">Connect Wallet</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 font-mono">Total Portfolio Value</div>
                </div>

                {/* Asset Breakdown */}
                <dl className="-my-3 divide-y divide-white/10 text-sm/6">
                  {/* USDC Balance */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-2 text-gray-400 font-mono">
                      <Image
                        src="/Cars/usdc.png"
                        alt="USDC"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                      Base USDC
                    </dt>
                    <dd className="font-medium text-white font-mono">
                      {isConnected ? (
                        `$${parseFloat(usdcBalance).toLocaleString()}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </dd>
                  </div>

                  {/* ETH Balance */}
                  <div className="flex justify-between gap-x-4 py-3">
                    <dt className="flex items-center gap-2 text-gray-400 font-mono">
                      <Image
                        src="/Cars/base-logo.png"
                        alt="Base ETH"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full"
                      />
                      Base ETH
                    </dt>
                    <dd className="text-right">
                      <div className="font-medium text-white font-mono">
                        {isConnected ? (
                          `${parseFloat(ethBalance).toFixed(4)}`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                      {isConnected && parseFloat(ethBalance) > 0 && (
                        <ETHPriceDisplay
                          ethAmount={ethBalance}
                          className="text-xs text-[#00daa2] font-mono mt-1"
                        />
                      )}
                    </dd>
                  </div>
                </dl>

                {/* Action Buttons */}
                <div className="mt-6">
                  {!isConnected ? (
                    <button className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent">
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                      <span className="relative z-10 font-mono">Connect Wallet</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSwapModal(true)}
                      className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                      {/* Green Accent Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-r from-[#00daa2]/20 via-transparent to-[#00daa2]/20 opacity-50"></div>
                      <span className="relative z-10 font-mono">Swap</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My NFT Keys Section */}
        <MyNFTKeys />
      </div>

      {/* Swap Modal - Placed outside main container for full viewport coverage */}
      <BusterSwapModal
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        swapType="buy"
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />
    </div>
  );
}
