import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinFlow - Mobile Personal Finance",
  description: "Mobile-first personal digital wallet with routine habit tracking and savings simulation",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030712] min-h-screen text-slate-100 antialiased flex justify-center">
        {/* Mobile Viewport Container Shell */}
        <div className="w-full max-w-md min-h-screen bg-[#0B0F19] flex flex-col relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] border-x border-slate-900/80">
          {children}
        </div>
      </body>
    </html>
  );
}
