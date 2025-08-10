import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between shadow-sm bg-gray-950 z-10 relative">
      <Link href="#" className="flex items-center justify-center">
        <GraduationCap className="h-7 w-7 text-blue-400" />
        <span className="ml-2 text-2xl font-bold text-white">Scholian</span>
      </Link>
      <nav className="flex gap-4 sm:gap-6">
        <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">
          Login
        </Link>
        <Button asChild variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2">
          <Link href="/signup">Get Started</Link>
        </Button>
      </nav>
    </header>
  )
}
