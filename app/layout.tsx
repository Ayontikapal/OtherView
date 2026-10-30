import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "OtherView — Multimodal AI Physical Accessibility Review",
  description:
    "See the space differently. Design for more people. OtherView analyzes photographs of physical environments to identify accessibility considerations across wheelchair, low vision, mobility, and sensory perspectives.",
  keywords: [
    "accessibility",
    "inclusive design",
    "ADA compliance review",
    "physical environment",
    "wheelchair accessibility",
    "low vision",
    "sensory design",
  ],
  authors: [{ name: "OtherView Team" }],
};

import { AuthProvider } from "@/lib/auth/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 antialiased selection:bg-indigo-500 selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg font-medium text-sm outline-none"
        >
          Skip to main content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
