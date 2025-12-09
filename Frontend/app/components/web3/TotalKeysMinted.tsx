"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { Trophy, ArrowUp } from "lucide-react";
import deployedContracts from "../../../contracts/deployedContracts";

interface ContractData {
  name: string;
  address: string;
  totalMinted: bigint | undefined;
  maxSupply: bigint | undefined;
  isLoading: boolean;
  error: string | null;
}

export default function TotalKeysMinted() {
  const [contractsData, setContractsData] = useState<ContractData[]>([
    {
      name: "Steel Key",
      address: "0x0Efc7EFbbeB794517D62aaD40143f46CF6653f28",
      totalMinted: undefined,
      maxSupply: undefined,
      isLoading: true,
      error: null,
    },
    {
      name: "Carbon Key",
      address: "0x56E75E06F2213A20F35d92E57a958210610F0Aa8",
      totalMinted: undefined,
      maxSupply: undefined,
      isLoading: true,
      error: null,
    },
    {
      name: "Titanium Key",
      address: "0x958468063cA58C641e7b98FC4c7EE6fBd3238145",
      totalMinted: undefined,
      maxSupply: undefined,
      isLoading: true,
      error: null,
    },
  ]);

  // Read totalSupply from each contract
  const steelTotalSupply = useReadContract({
    address: "0x0Efc7EFbbeB794517D62aaD40143f46CF6653f28" as `0x${string}`,
    abi: deployedContracts[8453].SteelBuster.abi,
    functionName: "totalMinted",
  });

  const carbonTotalSupply = useReadContract({
    address: "0x56E75E06F2213A20F35d92E57a958210610F0Aa8" as `0x${string}`,
    abi: deployedContracts[8453].CarbonBuster.abi,
    functionName: "totalMinted",
  });

  const titaniumTotalSupply = useReadContract({
    address: "0x958468063cA58C641e7b98FC4c7EE6fBd3238145" as `0x${string}`,
    abi: deployedContracts[8453].TitaniumBuster.abi,
    functionName: "totalMinted",
  });

  // Read maxSupply from each contract
  const steelMaxSupply = useReadContract({
    address: "0x0Efc7EFbbeB794517D62aaD40143f46CF6653f28" as `0x${string}`,
    abi: deployedContracts[8453].SteelBuster.abi,
    functionName: "maxSupply",
  });

  const carbonMaxSupply = useReadContract({
    address: "0x56E75E06F2213A20F35d92E57a958210610F0Aa8" as `0x${string}`,
    abi: deployedContracts[8453].CarbonBuster.abi,
    functionName: "maxSupply",
  });

  const titaniumMaxSupply = useReadContract({
    address: "0x958468063cA58C641e7b98FC4c7EE6fBd3238145" as `0x${string}`,
    abi: deployedContracts[8453].TitaniumBuster.abi,
    functionName: "maxSupply",
  });

  // Update contracts data when contract reads complete
  useEffect(() => {
    setContractsData([
      {
        name: "Steel Key",
        address: "0x0Efc7EFbbeB794517D62aaD40143f46CF6653f28",
        totalMinted: steelTotalSupply.data as bigint | undefined,
        maxSupply: steelMaxSupply.data as bigint | undefined,
        isLoading: steelTotalSupply.isLoading || steelMaxSupply.isLoading,
        error: steelTotalSupply.error?.message || steelMaxSupply.error?.message || null,
      },
      {
        name: "Carbon Key",
        address: "0x56E75E06F2213A20F35d92E57a958210610F0Aa8",
        totalMinted: carbonTotalSupply.data as bigint | undefined,
        maxSupply: carbonMaxSupply.data as bigint | undefined,
        isLoading: carbonTotalSupply.isLoading || carbonMaxSupply.isLoading,
        error: carbonTotalSupply.error?.message || carbonMaxSupply.error?.message || null,
      },
      {
        name: "Titanium Key",
        address: "0x958468063cA58C641e7b98FC4c7EE6fBd3238145",
        totalMinted: titaniumTotalSupply.data as bigint | undefined,
        maxSupply: titaniumMaxSupply.data as bigint | undefined,
        isLoading: titaniumTotalSupply.isLoading || titaniumMaxSupply.isLoading,
        error: titaniumTotalSupply.error?.message || titaniumMaxSupply.error?.message || null,
      },
    ]);
  }, [
    steelTotalSupply.data,
    steelTotalSupply.isLoading,
    steelTotalSupply.error,
    steelMaxSupply.data,
    steelMaxSupply.isLoading,
    steelMaxSupply.error,
    carbonTotalSupply.data,
    carbonTotalSupply.isLoading,
    carbonTotalSupply.error,
    carbonMaxSupply.data,
    carbonMaxSupply.isLoading,
    carbonMaxSupply.error,
    titaniumTotalSupply.data,
    titaniumTotalSupply.isLoading,
    titaniumTotalSupply.error,
    titaniumMaxSupply.data,
    titaniumMaxSupply.isLoading,
    titaniumMaxSupply.error,
  ]);

  // Calculate totals
  const totalMinted = contractsData.reduce((sum, contract) => {
    return sum + (contract.totalMinted ? Number(contract.totalMinted) : 0);
  }, 0);

  const totalMaxSupply = contractsData.reduce((sum, contract) => {
    return sum + (contract.maxSupply ? Number(contract.maxSupply) : 0);
  }, 0);

  const totalPercentage = totalMaxSupply > 0 ? (totalMinted / totalMaxSupply) * 100 : 0;

  // Check if any contracts are still loading
  const isLoading = contractsData.some((contract) => contract.isLoading);

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2 font-mono">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#00daa2]" />
            Live Founder Key Specs
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400 font-mono">
            Real-time tracking of all founder key contracts including minted counts and progress.
          </p>
        </div>
      </div>

      {/* Stats Summary - Using Tailwind UI stats style */}
      <div className="mt-4 sm:mt-5">
        <h3 className="text-sm sm:text-base font-semibold text-white font-mono">
          Overall Statistics
        </h3>
        <dl className="mt-3 sm:mt-5 grid grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-lg bg-gray-800/20 shadow outline -outline-offset-1 outline-white/10 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
            <dt className="text-xs sm:text-sm md:text-base font-normal text-gray-300 font-mono">
              Total Minted
            </dt>
            <dd className="mt-1 flex items-baseline justify-between sm:block lg:flex">
              <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-[#00daa2]">
                {isLoading ? "..." : totalMinted.toLocaleString()}
              </div>
            </dd>
          </div>
          <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
            <dt className="text-xs sm:text-sm md:text-base font-normal text-gray-300 font-mono">
              Max Supply
            </dt>
            <dd className="mt-1 flex items-baseline justify-between sm:block lg:flex">
              <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-[#00daa2]">
                {isLoading ? "..." : totalMaxSupply.toLocaleString()}
              </div>
            </dd>
          </div>
          <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6">
            <dt className="text-xs sm:text-sm md:text-base font-normal text-gray-300 font-mono">
              Overall Progress
            </dt>
            <dd className="mt-1 flex flex-col sm:block lg:flex items-baseline justify-between gap-2 sm:gap-0">
              <div className="flex items-baseline text-xl sm:text-2xl font-semibold text-[#00daa2]">
                {isLoading ? "..." : `${totalPercentage.toFixed(1)}%`}
              </div>
              <div className="inline-flex items-baseline rounded-full bg-green-400/10 text-green-400 px-2 py-0.5 text-xs sm:text-sm font-medium sm:mt-2 lg:mt-0">
                <ArrowUp
                  aria-hidden="true"
                  className="-ml-1 mr-0.5 size-4 sm:size-5 shrink-0 self-center text-green-400"
                />
                <span className="sr-only">Progress</span>
                <span className="hidden sm:inline">
                  {isLoading
                    ? "..."
                    : `${totalMinted.toLocaleString()} / ${totalMaxSupply.toLocaleString()}`}
                </span>
                <span className="sm:hidden">
                  {isLoading
                    ? "..."
                    : `${totalMinted.toLocaleString()}/${totalMaxSupply.toLocaleString()}`}
                </span>
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* Table - Using Tailwind UI table style */}
      <div className="mt-4 sm:mt-8 flow-root">
        <div className="-mx-2 sm:-mx-4 -my-2 overflow-x-auto lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle px-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow outline outline-black/5 sm:rounded-lg dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
              <div className="overflow-x-auto">
                <table className="relative min-w-full divide-y divide-white/15">
                  <thead className="bg-gray-800/30">
                    <tr>
                      <th
                        scope="col"
                        className="py-2 sm:py-3.5 pl-2 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-gray-200 font-mono"
                      >
                        Contract
                      </th>
                      <th
                        scope="col"
                        className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-200 font-mono"
                      >
                        Minted
                      </th>
                      <th
                        scope="col"
                        className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-200 font-mono hidden sm:table-cell"
                      >
                        Max Supply
                      </th>
                      <th
                        scope="col"
                        className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-200 font-mono"
                      >
                        Progress
                      </th>
                      <th
                        scope="col"
                        className="px-2 sm:px-3 py-2 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-200 font-mono"
                      >
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-gray-800/20">
                    {contractsData.map((contract, index) => {
                      const contractPercentage =
                        contract.maxSupply && contract.totalMinted
                          ? (Number(contract.totalMinted) / Number(contract.maxSupply)) * 100
                          : 0;

                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-3 sm:py-4 pl-2 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-medium text-white font-mono">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                  index === 0
                                    ? "bg-blue-400"
                                    : index === 1
                                      ? "bg-green-400"
                                      : "bg-purple-400"
                                }`}
                              />
                              <span className="truncate max-w-[80px] sm:max-w-none">
                                {contract.name}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 font-mono">
                            {contract.isLoading ? (
                              <span className="text-gray-500">...</span>
                            ) : contract.error ? (
                              <span className="text-red-400 text-xs">Error</span>
                            ) : (
                              <span className="text-[#00daa2] font-semibold">
                                {contract.totalMinted?.toString() || "0"}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 font-mono hidden sm:table-cell">
                            {contract.isLoading ? "..." : contract.maxSupply?.toString() || "0"}
                          </td>
                          <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 font-mono">
                            {contract.isLoading ? (
                              <span className="text-gray-500">...</span>
                            ) : contract.error ? (
                              <span className="text-red-400 text-xs">-</span>
                            ) : (
                              <div className="w-20 sm:w-32">
                                <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2">
                                  <div
                                    className="h-full bg-[#00daa2] rounded-full transition-all duration-500"
                                    style={{
                                      width: `${contractPercentage}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-400 font-mono">
                            {contract.isLoading ? (
                              <span className="text-gray-500">...</span>
                            ) : contract.error ? (
                              <span className="text-red-400 text-xs">-</span>
                            ) : (
                              <span className="text-[#00daa2] font-semibold">
                                {contractPercentage.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
