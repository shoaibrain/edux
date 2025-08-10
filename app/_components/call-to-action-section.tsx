import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CallToActionSection() {
  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-gray-950">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            Join hundreds of modern educational institutions already streamlining their operations with Scholian.
            Experience the future of school management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
            >
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-900 hover:text-white rounded-full px-8 py-3 text-lg font-semibold bg-transparent"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
