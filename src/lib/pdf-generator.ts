"use client";

import { jsPDF } from "jspdf";
import { SHA256 } from "crypto-js";

export interface CertificateData {
    name: string;
    email: string;
}

export interface GeneratedCertificate {
    blob: Blob;
    hash: string;
    dataUrl: string;
}

export function generateCertificatePDF(
    data: CertificateData
): GeneratedCertificate {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // White background (default)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Simple border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Top line separator
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(30, 45, pageWidth - 30, 45);

    // Title
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("CERTIFICATE", pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Sertifikat Digital", pageWidth / 2, 55, { align: "center" });

    // Subtitle
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Diberikan kepada:", pageWidth / 2, 75, { align: "center" });

    // Name
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(data.name, pageWidth / 2, 95, { align: "center" });

    // Line under name
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    const nameWidth = Math.min(doc.getTextWidth(data.name), pageWidth - 80);
    doc.line(
        (pageWidth - nameWidth) / 2 - 10,
        100,
        (pageWidth + nameWidth) / 2 + 10,
        100
    );

    // Email
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Email: ${data.email}`, pageWidth / 2, 115, { align: "center" });

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Tanggal: ${dateStr}`, pageWidth / 2, 130, { align: "center" });

    // ID
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`ID: ${now.getTime()}`, pageWidth / 2, 145, { align: "center" });

    // Bottom line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.line(30, 155, pageWidth - 30, 155);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
        "Sertifikat ini diverifikasi melalui teknologi Blockchain",
        pageWidth / 2,
        165,
        { align: "center" }
    );

    // Generate output
    const pdfOutput = doc.output("arraybuffer");
    const blob = new Blob([pdfOutput], { type: "application/pdf" });

    // Hash the raw PDF content
    const wordArray = arrayBufferToWordArray(pdfOutput);
    const hash = SHA256(wordArray).toString();

    // Generate data URL for preview
    const dataUrl = doc.output("datauristring");

    return { blob, hash, dataUrl };
}

// Helper: convert ArrayBuffer to CryptoJS WordArray for hashing
function arrayBufferToWordArray(
    ab: ArrayBuffer
): ReturnType<typeof SHA256> extends infer T ? Parameters<typeof SHA256>[0] : never {
    const i8a = new Uint8Array(ab);
    const a: number[] = [];
    for (let i = 0; i < i8a.length; i += 4) {
        a.push(
            (i8a[i] << 24) |
            (i8a[i + 1] << 16) |
            (i8a[i + 2] << 8) |
            i8a[i + 3]
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const CryptoJS = require("crypto-js");
    return CryptoJS.lib.WordArray.create(a, i8a.length);
}

export function downloadPDF(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sertifikat-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
