"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Shield, Search, Loader2, CheckCircle2, XCircle, Upload, Hash } from "lucide-react";
import { verifyHashOnChain } from "@/lib/blockchain";
import { SHA256 } from "crypto-js";

export function VerifyCertificate() {
    const [hashInput, setHashInput] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<{
        isValid: boolean;
        timestamp: number;
        txHash: string | null;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"hash" | "file">("hash");

    const handleVerify = async () => {
        if (!hashInput.trim()) return;
        setIsVerifying(true);
        setResult(null);
        setError(null);
        try {
            const res = await verifyHashOnChain(hashInput.trim());
            setResult(res);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const a: number[] = [];
        for (let i = 0; i < uint8.length; i += 4) {
            a.push(
                (uint8[i] << 24) |
                (uint8[i + 1] << 16) |
                (uint8[i + 2] << 8) |
                uint8[i + 3]
            );
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const CryptoJS = require("crypto-js");
        const wordArray = CryptoJS.lib.WordArray.create(a, uint8.length);
        const hash = SHA256(wordArray).toString();
        setHashInput(hash);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verifikasi Sertifikat
                </CardTitle>
                <CardDescription>
                    Cek keaslian sertifikat dengan memasukkan hash atau upload file PDF.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant={mode === "hash" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("hash")}
                    >
                        <Hash className="mr-2 h-3 w-3" />
                        Input Hash
                    </Button>
                    <Button
                        variant={mode === "file" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("file")}
                    >
                        <Upload className="mr-2 h-3 w-3" />
                        Upload PDF
                    </Button>
                </div>

                {/* Input */}
                {mode === "hash" ? (
                    <Input
                        placeholder="Masukkan SHA-256 hash..."
                        value={hashInput}
                        onChange={(e) => {
                            setHashInput(e.target.value);
                            setResult(null);
                        }}
                        className="font-mono text-sm"
                    />
                ) : (
                    <div className="space-y-2">
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-accent transition-colors">
                            <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                                <p className="text-sm text-muted-foreground">Upload file PDF</p>
                            </div>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        {hashInput && (
                            <p className="text-xs text-muted-foreground break-all">
                                Hash: <span className="font-mono">{hashInput}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Verify Button */}
                <Button
                    onClick={handleVerify}
                    disabled={!hashInput.trim() || isVerifying}
                    className="w-full"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memverifikasi...
                        </>
                    ) : (
                        <>
                            <Search className="mr-2 h-4 w-4" />
                            Verifikasi di Blockchain
                        </>
                    )}
                </Button>

                {/* Result */}
                {result && (
                    <div className={`rounded-md border p-4 ${result.isValid ? "bg-muted" : "border-destructive/50 bg-destructive/10"}`}>
                        {result.isValid ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Sertifikat Valid! ✅</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Tersimpan di Blockchain pada:{" "}
                                    <span className="font-medium text-foreground">
                                        {new Date(result.timestamp * 1000).toLocaleString("id-ID")}
                                    </span>
                                </p>
                                <div className="space-y-1 pt-1">
                                    {result.txHash && (
                                        <a
                                            href={`https://sepolia.arbiscan.io/tx/${result.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-primary underline"
                                        >
                                            🔗 Lihat Transaksi di Arbiscan
                                        </a>
                                    )}
                                    <a
                                        href="https://sepolia.arbiscan.io/address/0x10db2F7Bf11622D6C8bE6e6073Df0755D3b2F090"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-xs text-primary underline"
                                    >
                                        📄 Lihat Smart Contract di Arbiscan
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-destructive" />
                                <span className="font-medium text-destructive">
                                    Sertifikat tidak ditemukan di Blockchain ❌
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">❌ {error}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
