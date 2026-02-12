"use client";

import { ethers } from "ethers";

// Update this after deploying contract to Arbitrum Sepolia
const CONTRACT_ADDRESS = "0x10db2F7Bf11622D6C8bE6e6073Df0755D3b2F090";
const CONTRACT_ABI = [
    {
        inputs: [{ internalType: "string", name: "_hash", type: "string" }],
        name: "storeHash",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ internalType: "string", name: "_hash", type: "string" }],
        name: "verifyHash",
        outputs: [
            { internalType: "bool", name: "", type: "bool" },
            { internalType: "uint256", name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [{ internalType: "string", name: "", type: "string" }],
        name: "certificates",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "string",
                name: "certificateHash",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        name: "CertificateMinted",
        type: "event",
    },
];

// Arbitrum Sepolia Testnet chain ID
const ARB_SEPOLIA_CHAIN_ID = "0x66eee"; // 421614

declare global {
    interface Window {
        ethereum?: ethers.Eip1193Provider & {
            on?: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
    }
}

export async function connectWallet(): Promise<string> {
    if (!window.ethereum) {
        throw new Error("MetaMask belum terinstall! Silakan install MetaMask terlebih dahulu.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);

    // Switch to Arbitrum Sepolia Testnet
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ARB_SEPOLIA_CHAIN_ID }],
        });
    } catch (switchError: unknown) {
        const err = switchError as { code: number };
        if (err.code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: ARB_SEPOLIA_CHAIN_ID,
                        chainName: "Arbitrum Sepolia Testnet",
                        nativeCurrency: {
                            name: "ETH",
                            symbol: "ETH",
                            decimals: 18,
                        },
                        rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
                        blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }

    return accounts[0];
}

export async function storeHashOnChain(hash: string): Promise<string> {
    if (!window.ethereum) {
        throw new Error("MetaMask belum terinstall!");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Get current fee data and add buffer for L2 networks
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas
        ? (feeData.maxFeePerGas * BigInt(150)) / BigInt(100)  // +50% buffer
        : undefined;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
        ? (feeData.maxPriorityFeePerGas * BigInt(150)) / BigInt(100)
        : undefined;

    const tx = await contract.storeHash(hash, {
        maxFeePerGas,
        maxPriorityFeePerGas,
    });
    await tx.wait();

    return tx.hash;
}

export async function verifyHashOnChain(
    hash: string
): Promise<{ isValid: boolean; timestamp: number; txHash: string | null }> {
    if (!window.ethereum) {
        throw new Error("MetaMask belum terinstall!");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const [isValid, timestamp] = await contract.verifyHash(hash);

    let txHash: string | null = null;

    // If valid, query event logs to find the original transaction
    if (isValid) {
        try {
            const filter = contract.filters.CertificateMinted(hash);
            const events = await contract.queryFilter(filter);
            if (events.length > 0) {
                txHash = events[0].transactionHash;
            }
        } catch (e) {
            console.warn("Could not fetch event logs:", e);
        }
    }

    return {
        isValid,
        timestamp: Number(timestamp),
        txHash,
    };
}

export function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
