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
import {
    FileText,
    Hash,
    Download,
    Loader2,
    CheckCircle2,
    Copy,
    Check,
    Send,
} from "lucide-react";
import {
    generateCertificatePDF,
    downloadPDF,
    type GeneratedCertificate,
} from "@/lib/pdf-generator";
import { storeHashOnChain } from "@/lib/blockchain";

interface CertificateFormProps {
    walletAddress: string | null;
}

export function CertificateForm({ walletAddress }: CertificateFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [certificate, setCertificate] = useState<GeneratedCertificate | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isStoring, setIsStoring] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = name.trim().length > 0 && email.trim().length > 0;

    const handleGenerate = async () => {
        if (!isFormValid) return;
        setIsGenerating(true);
        setError(null);
        setCertificate(null);
        setTxHash(null);
        try {
            await new Promise((r) => setTimeout(r, 500));
            const cert = generateCertificatePDF({ name: name.trim(), email: email.trim() });
            setCertificate(cert);
        } catch (err) {
            setError("Gagal membuat sertifikat: " + (err as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (certificate) downloadPDF(certificate.blob, name);
    };

    const handleStoreOnChain = async () => {
        if (!certificate) return;
        setIsStoring(true);
        setError(null);
        try {
            const hash = await storeHashOnChain(certificate.hash);
            setTxHash(hash);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsStoring(false);
        }
    };

    const handleCopyHash = async () => {
        if (!certificate) return;
        await navigator.clipboard.writeText(certificate.hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setName("");
        setEmail("");
        setCertificate(null);
        setTxHash(null);
        setError(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Buat Sertifikat Digital
                    </CardTitle>
                    <CardDescription>
                        Masukkan data untuk membuat sertifikat digital yang diamankan oleh Blockchain.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Nama Lengkap
                        </label>
                        <Input
                            id="name"
                            placeholder="Masukkan nama lengkap..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!!certificate}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!!certificate}
                        />
                    </div>

                    {!certificate ? (
                        <Button
                            onClick={handleGenerate}
                            disabled={!isFormValid || isGenerating}
                            className="w-full"
                            size="lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Membuat Sertifikat...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Sertifikat PDF
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleReset} variant="outline" className="w-full">
                            Buat Sertifikat Baru
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Result Card */}
            {certificate && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Sertifikat Berhasil Dibuat!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* PDF Preview */}
                        <div className="overflow-hidden rounded-md border">
                            <iframe
                                src={certificate.dataUrl}
                                className="h-[300px] w-full"
                                title="Certificate Preview"
                            />
                        </div>

                        {/* Hash Display */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Hash className="h-4 w-4" />
                                SHA-256 Hash
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">
                                    {certificate.hash}
                                </code>
                                <Button variant="outline" size="icon" onClick={handleCopyHash}>
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button onClick={handleDownload} variant="outline" className="flex-1">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button
                                onClick={handleStoreOnChain}
                                disabled={!walletAddress || isStoring || !!txHash}
                                className="flex-1"
                            >
                                {isStoring ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : txHash ? (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Tersimpan!
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Simpan ke Blockchain
                                    </>
                                )}
                            </Button>
                        </div>

                        {!walletAddress && (
                            <p className="text-center text-sm text-muted-foreground">
                                ⚠️ Hubungkan wallet untuk menyimpan hash ke Blockchain
                            </p>
                        )}

                        {txHash && (
                            <div className="rounded-md border bg-muted p-3 space-y-1">
                                <p className="text-sm font-medium">✅ Berhasil disimpan di Blockchain!</p>
                                <a
                                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline break-all"
                                >
                                    Lihat di Polygonscan: {txHash}
                                </a>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                                <p className="text-sm text-destructive">❌ {error}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
