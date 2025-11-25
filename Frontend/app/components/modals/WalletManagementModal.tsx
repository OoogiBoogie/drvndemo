"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, type Connector } from "wagmi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Wallet, CheckCircle } from "lucide-react";

interface WalletManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WalletManagementModal({ isOpen, onClose }: WalletManagementModalProps) {
    const { address, isConnected, connector } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async (connector: Connector) => {
        setIsLoading(true);
        try {
            await connect({ connector });
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            await disconnect();
        } catch (error) {
            console.error("Failed to disconnect wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white font-mono flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#00daa2]" />
                        Manage Wallets
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Connected Wallet Section */}
                    {isConnected && address ? (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 font-mono">
                                Connected Wallet
                            </h3>
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#00daa2]/20 rounded-full flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-[#00daa2]" />
                                        </div>
                                        <div>
                                            <p className="text-white font-mono font-medium">
                                                {connector?.name || "Wallet"}
                                            </p>
                                            <p className="text-gray-400 text-sm font-mono">
                                                {formatAddress(address)}
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-[#00daa2]" />
                                </div>
                                <Button
                                    onClick={handleDisconnect}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="w-full border-red-500 text-red-500 hover:bg-red-500/10 font-mono"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-400 font-mono">
                                Available Wallets
                            </h3>
                            {connectors.map((connector) => (
                                <button
                                    key={connector.id}
                                    onClick={() => handleConnect(connector)}
                                    disabled={isLoading}
                                    className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                            <Wallet className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-mono">
                                            {connector.name}
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
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Info Section */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-300 text-xs font-mono">
                            💡 Your wallet is your identity on DRVN. Connect to access all features.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-800 font-mono"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
