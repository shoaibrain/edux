import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, BarChart } from 'lucide-react';
import {HeroSection} from "@/app/_components/hero-section";
import {FeaturesSection} from "@/app/_components/features-section";
import {SecuritySection} from "@/app/_components/security-section";
import {CallToActionSection} from "@/app/_components/call-to-action-section";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-black">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-white dark:bg-gray-950">
        <Link href="#" className="flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Scholian</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 text-gray-600 dark:text-gray-300">
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <SecuritySection />
        <CallToActionSection />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white dark:bg-gray-950">
        <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2025 Scholian Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}