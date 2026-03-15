import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { Suspense } from "react";
import { Toaster } from "sonner";
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";
import { Hourglass } from "ldrs/react";
import "ldrs/react/Hourglass.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickQuery",
  description: "Query your documents with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <Suspense
          fallback={
            <Hourglass size="40" bgOpacity="0.1" speed="1.75" color="black" />
          }
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkProvider>{children}</ClerkProvider>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
