import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 xl:py-56 overflow-hidden bg-gradient-to-br from-gray-950 to-blue-950">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white">
                The All-In-One Platform for <span className="text-blue-400">Modern Education</span>
              </h1>
              <p className="max-w-[700px] text-lg md:text-xl text-gray-300 mx-auto lg:mx-0">
                Scholian provides everything your institution needs to manage students, staff, and curriculum with
                unparalleled ease and robust security.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-900 hover:text-white rounded-full px-8 py-3 text-lg font-semibold bg-transparent"
              >
                <Link href="/demo">Request a Demo</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <img
              src="https://colorlib.com/wp/wp-content/uploads/sites/2/free-dashboard-templates-1.jpg?height=700&width=900"
              width="800"
              height="600"
              alt="Scholian Dashboard Screenshot"
              className="rounded-xl shadow-2xl border border-gray-700 transform transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
