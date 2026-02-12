"use client";

import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { CertificateForm } from "@/components/certificate-form";
import { VerifyCertificate } from "@/components/verify-certificate";
import { Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "create" | "verify";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("create");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h1 className="text-lg font-bold">CertChain</h1>
          </div>
          <WalletConnect
            onConnect={(addr) => setWalletAddress(addr)}
            onDisconnect={() => setWalletAddress(null)}
          />
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("create")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Buat Sertifikat
          </Button>
          <Button
            variant={activeTab === "verify" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("verify")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Verifikasi
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {activeTab === "create" ? (
          <CertificateForm walletAddress={walletAddress} />
        ) : (
          <VerifyCertificate />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="mx-auto max-w-4xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Polygon Blockchain • Built with Next.js & Shadcn/UI
          </p>
        </div>
      </footer>
    </div>
  );
}
