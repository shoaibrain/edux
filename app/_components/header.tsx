"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex h-16 items-center justify-between rounded-full border border-white/10 bg-black/50 p-2 px-6 shadow-lg backdrop-blur-xl">
          <Link href="#" className="flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-white" />
            <span className="ml-3 text-xl font-bold text-white tracking-wider">Scholian</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#security" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Security
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-white/10">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full bg-white text-black hover:bg-gray-200">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden mt-2 mx-4 rounded-xl border border-white/10 bg-black/50 shadow-lg backdrop-blur-xl overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col items-center gap-4 p-4">
          <Link href="#features" onClick={()=>setIsOpen(false)} className="w-full text-center py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#security" onClick={()=>setIsOpen(false)} className="w-full text-center py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Security
          </Link>
          <Link href="#pricing" onClick={()=>setIsOpen(false)} className="w-full text-center py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <div className="w-full border-t border-white/10 my-2"></div>
          <Button variant="ghost" asChild className="w-full text-gray-300 hover:text-white hover:bg-white/10">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="w-full rounded-full bg-white text-black hover:bg-gray-200">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
