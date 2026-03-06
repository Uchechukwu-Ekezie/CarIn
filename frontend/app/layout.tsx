import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppKitProvider } from "@/lib/providers/AppKitProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CarIn | Future of Urban Parking",
  description: "Next-gen decentralized parking infrastructure on Stacks",
  other: {
    "talentapp:project_verification": "162e3b286041aa961be0879994d8863772fafb164e2fdf01ff284dccab88440fe61e3fce56657cbc37a734efbfa6d6b3432c1ba2df9bc6479880467984e1cf64",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${outfit.className} bg-[#020202] text-white antialiased`}>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}
