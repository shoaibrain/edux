import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Scholian | The All-In-One Platform for Modern Education",
  description: "Scholian provides everything your institution needs to manage students, staff, and curriculum with unparalleled ease and robust security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-[#0A0A0A]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* The relative z-0 container ensures content renders above the grid background */}
          <div className="relative z-0">
            {children}
          </div>
          <SpeedInsights />
          <Toaster richColors theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
