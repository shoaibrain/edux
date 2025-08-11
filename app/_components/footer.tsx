import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full shrink-0 px-4 md:px-6 border-t border-white/10 text-gray-400">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 py-10">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center space-x-3">
                <GraduationCap className="h-6 w-6 text-gray-200" />
                <span className="text-xl font-bold text-white">Scholian</span>
            </div>
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Scholian Inc. All rights reserved.</p>
        </div>
        <nav className="flex gap-6">
          <Link href="#" className="text-sm hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="#" className="text-sm hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="#" className="text-sm hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
