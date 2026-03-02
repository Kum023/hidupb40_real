import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/providers/ConvexProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { Header } from "@/components/Header";
import { GlobalSettings } from "@/components/game/GlobalSettings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hidup B40",
  description: "Experience financial decisions through lived experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        <ConvexProvider>
          <AudioProvider>
            <Header />
            <div className="pt-12">
              {children}
            </div>
            <GlobalSettings />
          </AudioProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
