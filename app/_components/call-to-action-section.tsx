import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToActionSection() {
  return (
    <section id="pricing" className="w-full py-20 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8 relative">
           <div className="absolute -inset-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-10"></div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Join hundreds of modern educational institutions already streamlining their operations with Scholian.
            Experience the future of school management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-3 text-lg font-semibold bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 transition-all duration-300"
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
              className="rounded-full px-8 py-3 text-lg font-semibold bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
