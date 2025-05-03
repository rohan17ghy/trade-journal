import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

import "../styles/prosemirror.css";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Trade Journal",
    description: "Track your trading rules and performance",
    generator: "v0.dev",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                >
                    <div className="flex flex-col min-h-screen">
                        <Header />
                        <main className="flex-1 flex justify-center w-full">
                            {children}
                        </main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
