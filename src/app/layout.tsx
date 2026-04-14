import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Constituency Intelligence App",
  description: "Tamil Nadu Assembly Election Data Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
             <div className="container mx-auto flex h-14 items-center justify-between px-4">
               <div className="flex items-center gap-6">
                 <Link href="/" className="font-bold flex items-center space-x-2">
                   <span className="hidden sm:inline-block">Constituency Intel</span>
                 </Link>
                 <nav className="flex items-center space-x-6 text-sm font-medium">
                   <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Search</Link>
                 </nav>
               </div>
               <ThemeToggle />
             </div>
          </header>
          <main className="flex-1 py-8 h-full bg-slate-50 dark:bg-transparent">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
