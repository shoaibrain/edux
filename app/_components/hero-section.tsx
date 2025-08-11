"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative w-full pt-48 pb-20 md:pt-64 md:pb-28 lg:pt-72 lg:pb-32 overflow-hidden">
      {/* Abstract background shapes - more subtle now */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-500/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              The All-In-One Platform for Modern Education
            </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-gray-400">
            Scholian provides everything your institution needs to manage students, staff, and curriculum with
            unparalleled ease and robust security.
          </p>
            </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-3 text-lg font-semibold bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 transition-all duration-300"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-3 text-lg font-semibold bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              <Link href="/signup">
                <PlayCircle className="mr-2 h-5 w-5" />
                Request a Demo
              </Link>
            </Button>
          </div>
          </div>
          <div className="relative mt-20 lg:mt-24 group">
          <img
              src="https://colorlib.com/wp/wp-content/uploads/sites/2/free-dashboard-templates-1.jpg?height=700&width=900"
              width="1200"
              height="750"
              alt="Scholian Dashboard Screenshot"
              className="rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://colorlib.com/wp/wp-content/uploads/sites/2/free-dashboard-templates-1.jpg?height=700&width=900';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
