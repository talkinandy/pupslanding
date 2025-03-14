import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientBody from "./ClientBody";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "300", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PUPS | First Culture Coin on Bitcoin",
  description: "PUPS Token - The first culture coin on Bitcoin",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://web-assets.same.dev/629347999/863155112.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn("min-h-screen antialiased", poppins.variable)}>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
