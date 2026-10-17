import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";
import PageLoader from "@/components/PageLoader";
import MusicPlayer from "@/components/MusicPlayer";
import SecurityBlocker from "@/components/SecurityBlocker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://deargod-official.vercel.app"
  ),
  title: "DEARGOD WINTERFELL",
  description: "Official House of DEARGOD WINTERFELL",
  openGraph: {
    title: "DEARGOD WINTERFELL",
    description: "Official House of DEARGOD WINTERFELL",
    url: "https://deargod-official.vercel.app",
    siteName: "DEARGOD WINTERFELL",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DEARGOD WINTERFELL",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEARGOD WINTERFELL",
    description: "Official House of DEARGOD WINTERFELL",
    images: ["/images/og-image.jpg"],
  },
  icons: {
    icon: "/images/deargod-avatar.png",
    shortcut: "/images/deargod-avatar.png",
    apple: "/images/deargod-avatar.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} dark`}>
      <body className="min-h-screen bg-[#060709] text-[#F3F4F6] font-sans antialiased selection:bg-white selection:text-black overflow-x-hidden">
        <SecurityBlocker />
        <PageLoader />
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
