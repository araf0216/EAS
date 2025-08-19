import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EAS",
  description: "Optimized financial resource mapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body
        className={`${geist.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
