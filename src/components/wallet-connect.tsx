"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { connectWallet, shortenAddress } from "@/lib/blockchain";

interface WalletConnectProps {
    onConnect?: (address: string) => void;
    onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const addr = await connectWallet();
            setAddress(addr);
            onConnect?.(addr);
        } catch (error) {
            console.error("Wallet connection failed:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        setAddress(null);
        setShowDropdown(false);
        onDisconnect?.();
    };

    const handleAccountsChanged = useCallback(
        (accounts: unknown) => {
            const accs = accounts as string[];
            if (accs.length === 0) {
                setAddress(null);
                onDisconnect?.();
            } else {
                setAddress(accs[0]);
                onConnect?.(accs[0]);
            }
        },
        [onConnect, onDisconnect]
    );

    useEffect(() => {
        if (typeof window !== "undefined" && window.ethereum?.on) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            return () => {
                window.ethereum?.removeListener?.(
                    "accountsChanged",
                    handleAccountsChanged
                );
            };
        }
    }, [handleAccountsChanged]);

    if (address) {
        return (
            <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    {shortenAddress(address)}
                    <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
                {showDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover p-1 shadow-md z-50">
                        <button
                            onClick={handleDisconnect}
                            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <Button onClick={handleConnect} disabled={isConnecting} size="sm">
            <Wallet className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}
