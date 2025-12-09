"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { Input } from "./ui/input";
import { useToast } from "./ui/toast-context";
import deployedContracts from "../../contracts/deployedContracts";
import Confetti from "react-confetti";
import Image from "next/image";
import { Loader2, CheckCircle, AlertCircle, Coins, Gift, Users, Wallet } from "lucide-react";
import { AllBenefitsModal } from "./modals/all-benefits-modal";
import { BenefitsModal } from "./modals/benefits-modal";

// Contract addresses from your deployed contracts
const CONTRACTS = {
  SteelBuster: {
    address: "0x7923976a80cefFd50B31fD02B6cf7Cf5e0596280" as `0x${string}`,
    name: "DRVN Steel Key",
    image: "/Cars/Steel.gif",
    color: "from-gray-900 to-black",
    borderColor: "border-gray-500",
  },
  CarbonBuster: {
    address: "0xc2C24F1b84f6641f449bB75971deC9F059084F9B" as `0x${string}`,
    name: "DRVN Carbon Key",
    image: "/Cars/Carbon.gif",
    color: "from-gray-900 to-black",
    borderColor: "border-gray-600",
  },
  TitaniumBuster: {
    address: "0xa4CF51a9a3baF3b8eaab318e296ac3f56E3c029d" as `0x${string}`,
    name: "DRVN Titanium Key",
    image: "/Cars/Titanium.gif",
    color: "from-gray-900 to-black",
    borderColor: "border-gray-700",
  },
};

interface MintCardProps {
  contractName: "SteelBuster" | "CarbonBuster" | "TitaniumBuster";
  onMintSuccess?: () => void;
}

export default function NFTMintCard({ contractName, onMintSuccess }: MintCardProps) {
  const { address, isConnected } = useAccount();
  const [showBenefits, setShowBenefits] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [isApproving, setIsApproving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [pendingMintAmount, setPendingMintAmount] = useState(1);
  const [hasTriggeredSuccess, setHasTriggeredSuccess] = useState(false);
  const { addToast, removeToastByType } = useToast();

  const contract = CONTRACTS[contractName];
  const contractConfig = deployedContracts[8453][contractName];
  const contractAddress = contractConfig.address as `0x${string}`;
  const usdcConfig = deployedContracts[8453].USDC;
  const usdcAddress = usdcConfig.address as `0x${string}`;

  // Read contract data
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "mintPrice",
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  const { data: maxSupply } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "maxSupply",
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  const { data: totalMinted } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "totalMinted",
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  const { data: saleActive } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "saleActive",
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: boolean | undefined };

  const { data: rewardStatus } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "rewardStatusForMint",
    args: [BigInt(mintAmount)],
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: [boolean, bigint] | undefined };

  const { data: airdropFlag } = useReadContract({
    address: contractAddress,
    abi: contractConfig.abi,
    functionName: "airdropFlag",
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: boolean | undefined };

  // Check USDC allowance
  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: usdcConfig.abi,
    functionName: "allowance",
    args: address && usdcAddress ? ([address, contractAddress] as const) : undefined,
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  // Add USDC balance check
  const { data: usdcBalance } = useReadContract({
    address: usdcAddress,
    abi: usdcConfig.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  // Add BSTR token balance check
  const { data: bstrBalance } = useReadContract({
    address: deployedContracts[8453].BUSTERToken.address as `0x${string}`,
    abi: deployedContracts[8453].BUSTERToken.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 15000,
      staleTime: 0,
    },
  }) as { data: bigint | undefined };

  // USDC approval
  const {
    writeContract: approveUSDC,
    data: approveData,
    isPending: isApprovingTx,
  } = useWriteContract();

  // Mint function
  const { writeContract: mint, data: mintData, isPending: isMintingTx } = useWriteContract();

  // Wait for transactions
  const {
    isLoading: isApprovingReceipt,
    isSuccess: isApprovalSuccess,
    isError: isApprovalError,
  } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  const {
    isLoading: isMintingReceipt,
    isSuccess: isMintingSuccess,
    isError: isMintingError,
  } = useWaitForTransactionReceipt({
    hash: mintData,
  });

  // Reset success flag when mintData changes (new mint attempt)
  useEffect(() => {
    if (mintData) {
      setHasTriggeredSuccess(false);
    }
  }, [mintData]);

  // Cleanup toasts when component unmounts
  useEffect(() => {
    return () => {
      removeToastByType("minting", contractName);
      removeToastByType("approve", contractName);
      setHasTriggeredSuccess(false); // Reset success flag on unmount
    };
  }, [removeToastByType, contractName]);

  // Handle approval flow
  useEffect(() => {
    if (approveData && !isApprovingReceipt) {
      if (isApprovalSuccess) {
        setIsApproving(false);
        // Remove the "approve" toast and show success
        removeToastByType("approve", contractName);
        addToast({
          type: "success",
          title: "USDC Approved Successfully",
          message: `USDC approved for ${contract.name} minting`,
          contractName: contractName,
        });
        // Force a refresh of the allowance data
        // This will trigger a re-render and show the mint button
        console.log(`Approval successful for ${contractName}, allowance should update soon`);
      } else if (isApprovalError) {
        setIsApproving(false);
        // Remove the "approve" toast and show error
        removeToastByType("approve", contractName);
        addToast({
          type: "error",
          title: "Approval Failed",
          message: `Failed to approve USDC for ${contract.name}`,
          contractName: contractName,
        });
      }
    }
  }, [
    approveData,
    isApprovingReceipt,
    isApprovalSuccess,
    isApprovalError,
    addToast,
    removeToastByType,
    contract.name,
    contractName,
  ]);

  // Handle minting flow
  useEffect(() => {
    if (mintData && !isMintingReceipt) {
      if (isMintingSuccess && !hasTriggeredSuccess) {
        setIsMinting(false);
        setMintAmount(1);
        setPendingMintAmount(1); // Reset pending amount
        setHasTriggeredSuccess(true); // Mark success as triggered

        // Remove the "minting" toast and show success
        removeToastByType("minting", contractName);
        addToast({
          type: "success",
          title: "Minting Successful!",
          message: `Successfully minted ${pendingMintAmount} ${contract.name} key${pendingMintAmount > 1 ? "s" : ""}`,
          contractName: contractName,
          quantity: pendingMintAmount,
          hash: mintData,
        });
        onMintSuccess?.(); // Call the prop function
      } else if (isMintingError) {
        setIsMinting(false);
        setPendingMintAmount(1); // Reset pending amount
        // Remove the "minting" toast and show error
        removeToastByType("minting", contractName);
        addToast({
          type: "error",
          title: "Minting Failed",
          message: `Failed to mint ${contract.name} key${pendingMintAmount > 1 ? "s" : ""}`,
          contractName: contractName,
          quantity: pendingMintAmount,
        });
      }
    }
  }, [
    mintData,
    isMintingReceipt,
    isMintingSuccess,
    isMintingError,
    addToast,
    removeToastByType,
    contract.name,
    contractName,
    pendingMintAmount,
    onMintSuccess,
    hasTriggeredSuccess,
  ]);

  // Calculate available supply for minting
  const availableSupply =
    maxSupply && totalMinted !== undefined ? Number(maxSupply) - Number(totalMinted) : 0;

  // Calculate total cost
  const totalCost = mintPrice && mintAmount ? mintPrice * BigInt(mintAmount) : BigInt(0);
  const hasEnoughAllowance = allowance && totalCost ? allowance >= totalCost : false;

  // Button states - directly follow transaction status
  const isApprovalPending = isApproving || isApprovingTx || isApprovingReceipt;
  const isMintingPending = isMinting || isMintingTx || isMintingReceipt;

  // Show approve button only when needed and not pending
  const showApproveButton = !hasEnoughAllowance && !isApprovalPending && !isMintingPending;

  // Show mint button only when approved and not pending
  const showMintButton = hasEnoughAllowance && !isMintingPending && !isApprovalPending;

  // Handle retry scenarios after errors
  const showRetryApproval =
    !hasEnoughAllowance && !isApprovalPending && (isApprovalError || isMintingError);
  const showRetryMint = hasEnoughAllowance && !isMintingPending && isMintingError;

  // Debug logging for button states
  useEffect(() => {
    console.log(`${contractName} Button States:`, {
      hasEnoughAllowance,
      isApprovalPending,
      isMintingPending,
      showApproveButton,
      showMintButton,
      allowance: allowance?.toString(),
      totalCost: totalCost?.toString(),
    });
  }, [
    contractName,
    hasEnoughAllowance,
    isApprovalPending,
    isMintingPending,
    showApproveButton,
    showMintButton,
    allowance,
    totalCost,
  ]);

  // Handle USDC approval
  const handleApprove = () => {
    if (!mintPrice || !mintAmount || !isConnected || hasEnoughAllowance) return;

    setIsApproving(true);
    const totalCost = mintPrice * BigInt(mintAmount);

    // Show approval toast
    addToast({
      type: "approve",
      title: "Approve USDC",
      message: `Approving USDC for ${contract.name} minting...`,
      contractName: contractName,
      quantity: mintAmount,
    });

    approveUSDC({
      address: usdcAddress,
      abi: usdcConfig.abi,
      functionName: "approve",
      args: [contractAddress, totalCost] as const,
    });
  };

  // Handle mint
  const handleMint = () => {
    if (!mintAmount || !hasEnoughAllowance || !isConnected) return;

    setIsMinting(true);
    setPendingMintAmount(mintAmount);
    setHasTriggeredSuccess(false); // Reset success flag for new mint
    removeToastByType("minting", contractName);

    // Show minting toast
    addToast({
      type: "minting",
      title: "Minting in Progress",
      message: `Minting ${mintAmount} ${contract.name} key${mintAmount > 1 ? "s" : ""}...`,
      contractName: contractName,
      quantity: mintAmount,
    });

    mint({
      address: contractAddress,
      abi: contractConfig.abi,
      functionName: "mint",
      args: [BigInt(mintAmount)] as const,
    });
  };

  // Format reward status
  const formatRewardStatus = () => {
    if (!rewardStatus) return "Loading...";

    const [active, totalRewards] = rewardStatus;

    if (!active) return "Rewards disabled";

    const totalRewardAmount = formatUnits(totalRewards, 9);

    // Limit BSTR to 4 decimal places for better readability
    const parts = totalRewardAmount.split(".");
    const formattedAmount =
      parts[1] && parts[1].length > 4
        ? parts[0] + "." + parts[1].substring(0, 4)
        : totalRewardAmount;

    return `${formattedAmount} BSTR`;
  };

  // Format USDC price
  const formatPrice = (price: bigint) => {
    return formatUnits(price, 6); // USDC has 6 decimals
  };

  // Format percentage
  const formatPercentage = (minted: bigint, max: bigint) => {
    if (!minted || !max) return "0%";
    const percentage = (Number(minted) / Number(max)) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl outline -outline-offset-1 outline-white/10 bg-gray-950">
        {/* Header with Image and Name */}
        <div className="flex items-center gap-x-4 border-b border-white/10 bg-white/5 p-6">
          <div className="size-12 flex-none rounded-lg bg-linear-to-r from-gray-600 to-gray-700 object-cover ring-1 ring-white/10 overflow-hidden">
            <Image
              src={contract.image}
              alt={contract.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm/6 font-semibold text-white font-mono">{contract.name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
              <Coins className="w-3 h-3" />
              <span>
                Key #
                {contractName === "SteelBuster" ? "0" : contractName === "CarbonBuster" ? "1" : "2"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <dl className="-my-3 divide-y divide-white/10 text-sm/6 mb-4">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-400 font-mono">Supply</dt>
              <dd className="font-medium text-white font-mono">{maxSupply?.toString() || "0"}</dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-400 font-mono">Minted</dt>
              <dd className="font-medium text-white font-mono">{totalMinted?.toString() || "0"}</dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-400 font-mono">Available</dt>
              <dd className="font-medium text-white font-mono">{availableSupply}</dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-400 font-mono">Price</dt>
              <dd className="font-medium text-white font-mono">
                {mintPrice ? `${formatPrice(mintPrice)} USDC` : "..."}
              </dd>
            </div>
          </dl>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
              <span>Progress</span>
              <span>
                {totalMinted && maxSupply ? `${formatPercentage(totalMinted, maxSupply)}` : "0%"}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-linear-to-r from-[#00daa2] to-[#00b894] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width:
                    maxSupply && totalMinted
                      ? `${(Number(totalMinted) / Number(maxSupply)) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          {/* Status Indicators */}
          <dl className="-my-3 divide-y divide-white/10 text-sm/6 mb-4">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="flex items-center gap-2 text-gray-400 font-mono">
                <Gift className="w-4 h-4 text-yellow-400" />
                Mint Rewards
              </dt>
              <dd className="font-medium text-white font-mono text-xs">{formatRewardStatus()}</dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="flex items-center gap-2 text-gray-400 font-mono">
                <Users className="w-4 h-4 text-green-400" />
                Auto Airdrop
              </dt>
              <dd className="font-medium text-white font-mono text-xs">
                {airdropFlag ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Yes
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-400 font-mono">Sale Status</dt>
              <dd
                className={`font-medium text-xs font-mono ${
                  saleActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {saleActive ? "🟢 Active" : "🔴 Inactive"}
              </dd>
            </div>
          </dl>

          {/* Wallet Balances - Only show when connected */}
          {isConnected && (
            <dl className="-my-3 divide-y divide-white/10 text-sm/6 mb-4">
              <div className="flex items-center gap-2 py-2 mb-2">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-gray-400 text-xs font-mono">Wallet Balances</span>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-400 font-mono">USDC</dt>
                <dd className="font-medium text-white font-mono">
                  {usdcBalance
                    ? `$${Number(formatUnits(usdcBalance, 6)).toLocaleString()}`
                    : "$0.00"}
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-400 font-mono">BSTR</dt>
                <dd className="font-medium text-white font-mono">
                  {bstrBalance ? Number(formatUnits(bstrBalance, 9)).toLocaleString() : "0"}
                </dd>
              </div>
            </dl>
          )}

          {/* Minting Interface */}
          {isConnected && saleActive ? (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-xs font-medium font-mono">Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  max={availableSupply || 100}
                  value={mintAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 0) {
                      setMintAmount(value);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (availableSupply && value > availableSupply) {
                      setMintAmount(availableSupply);
                    } else if (value < 1) {
                      setMintAmount(1);
                    }
                  }}
                  className="w-20 bg-white/5 border-white/10 text-white text-center text-sm font-mono"
                  placeholder="Enter amount"
                />
                <span className="text-[#00daa2] text-xs font-mono">/ {availableSupply}</span>
              </div>

              {/* Total Cost */}
              <dl className="-my-3 divide-y divide-white/10 text-sm/6">
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-[#00daa2] font-mono">Total Cost</dt>
                  <dd className="font-medium text-white font-mono">
                    {totalCost ? `${formatPrice(totalCost)} USDC` : "0 USDC"}
                  </dd>
                </div>
              </dl>

              {/* View Benefits Button */}
              <button
                onClick={() => setShowBenefits(true)}
                className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                {/* Purple/Blue Accent Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-r from-purple-600/20 via-transparent to-blue-600/20 opacity-50"></div>
                <Gift className="relative z-10 w-4 h-4" />
                <span className="relative z-10 font-mono">View Benefits</span>
              </button>

              {/* Action Buttons */}
              {showApproveButton && (
                <button
                  onClick={handleApprove}
                  disabled={isApprovalPending}
                  className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                  {/* Blue Accent Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-transparent to-blue-600/20 opacity-50"></div>
                  {isApprovalPending ? (
                    <>
                      <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
                      <span className="relative z-10 font-mono">Approving...</span>
                    </>
                  ) : (
                    <span className="relative z-10 font-mono">Approve USDC</span>
                  )}
                </button>
              )}
              {showRetryApproval && (
                <button
                  onClick={handleApprove}
                  disabled={isApprovalPending}
                  className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                  {/* Blue Accent Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 via-transparent to-blue-600/20 opacity-50"></div>
                  {isApprovalPending ? (
                    <>
                      <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
                      <span className="relative z-10 font-mono">Approving...</span>
                    </>
                  ) : (
                    <span className="relative z-10 font-mono">Retry Approval</span>
                  )}
                </button>
              )}
              {showMintButton && (
                <button
                  onClick={handleMint}
                  disabled={isMintingPending}
                  className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                  {/* Green Accent Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-[#00daa2]/20 via-transparent to-[#00daa2]/20 opacity-50"></div>
                  {isMintingPending ? (
                    <>
                      <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
                      <span className="relative z-10 font-mono">Minting...</span>
                    </>
                  ) : (
                    <span className="relative z-10 font-mono">
                      Mint {mintAmount} Key{mintAmount > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              )}
              {showRetryMint && (
                <button
                  onClick={handleMint}
                  disabled={isMintingPending}
                  className="auth-choice-btn-primary w-full relative flex items-center justify-center gap-2 py-3 px-4 border border-white/20 text-white font-sans font-semibold text-sm uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
                  {/* Green Accent Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-[#00daa2]/20 via-transparent to-[#00daa2]/20 opacity-50"></div>
                  {isMintingPending ? (
                    <>
                      <Loader2 className="relative z-10 w-4 h-4 animate-spin" />
                      <span className="relative z-10 font-mono">Minting...</span>
                    </>
                  ) : (
                    <span className="relative z-10 font-mono">Retry Mint</span>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              {!isConnected ? (
                <div className="text-gray-400 text-xs font-mono">Connect wallet to mint</div>
              ) : !saleActive ? (
                <div className="text-red-400 text-xs font-mono">Sale is currently inactive</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Benefits Modal */}
      {showBenefits && (
        <BenefitsModal
          isOpen={showBenefits}
          onClose={() => setShowBenefits(false)}
          keyType={
            contractName.toLowerCase().replace("buster", "") as "steel" | "carbon" | "titanium"
          }
        />
      )}
    </>
  );
}

// Main component that renders all three mint cards
export function NFTMintGrid() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showBenefits, setShowBenefits] = useState(false);

  // Set window dimensions on mount
  useEffect(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Function to trigger confetti from child components
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      {showConfetti && windowDimensions.width > 0 && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={[
            "#00daa2",
            "#00b894",
            "#ff6b6b",
            "#4ecdc4",
            "#45b7d1",
            "#96ceb4",
            "#feca57",
            "#ff9ff3",
          ]}
        />
      )}

      {/* Header */}
      <div className="text-left mb-8 mt-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-mono">
          Founder&apos;s Club Keys
        </h1>
        <p className="text-left text-gray-400 max-w-2xl font-mono">
          Collect your DRVN Founder&apos;s Club keys to unlock exclusive benefits, larger rewards,
          and voting power within the DRVN DAO.
        </p>
      </div>

      {/* Mint Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NFTMintCard contractName="SteelBuster" onMintSuccess={triggerConfetti} />
        <NFTMintCard contractName="CarbonBuster" onMintSuccess={triggerConfetti} />
        <NFTMintCard contractName="TitaniumBuster" onMintSuccess={triggerConfetti} />
      </div>

      {/* Holder Benefits Button */}
      {/* <div className="flex justify-center mt-8">
        <button
          onClick={() => setShowBenefits(true)}
          className="auth-choice-btn-primary relative flex items-center justify-center gap-2 py-4 px-8 border border-white/20 text-white font-sans font-semibold text-base uppercase tracking-wide overflow-hidden group hover:border-white/30 transition-all duration-300 cursor-pointer bg-transparent"
        >
          
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-r from-purple-600/20 via-transparent to-blue-600/20 opacity-50"></div>
          <Gift className="relative z-10 w-5 h-5" />
          <span className="relative z-10 font-mono">Holder Benefits</span>
        </button>
      </div> */}

      {/* Additional Info */}
      {/* <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-2">3</div>
            <div className="text-gray-400 text-sm">Unique Key Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">200</div>
            <div className="text-gray-400 text-sm">Total Supply</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-2">BSTR</div>
            <div className="text-gray-400 text-sm">Reward Token</div>
          </div>
        </div>
      </div> */}

      {/* All Benefits Modal */}
      <AllBenefitsModal isOpen={showBenefits} onClose={() => setShowBenefits(false)} />
    </div>
  );
}
