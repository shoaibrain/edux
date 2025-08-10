import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-10 w-full shrink-0 px-4 md:px-6 border-t border-gray-800 bg-gray-950 text-gray-400">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-6 w-6 text-blue-400" />
          <span className="text-xl font-bold text-white">Scholian</span>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} Scholian Inc. All rights reserved.</p>
        <nav className="flex gap-6">
          <Link href="#" className="text-sm hover:text-blue-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:text-blue-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-sm hover:text-blue-400 transition-colors">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  )
}
