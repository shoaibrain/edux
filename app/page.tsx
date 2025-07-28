import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, BarChart } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
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
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900 dark:text-white">
                    The All-In-One Platform for Modern Education
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Scholian provides everything your institution needs to manage students, staff, and curriculum with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://placehold.co/600x600/e2e8f0/4a5568?text=Scholian+Dashboard"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-800">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 dark:text-white">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform is packed with features designed to streamline your administrative tasks and enhance the learning experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-2">
                <GraduationCap className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Student Management</h3>
                <p className="text-gray-500 dark:text-gray-400">Keep track of student records, attendance, and grades in one place.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <BookOpen className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Curriculum Planning</h3>
                <p className="text-gray-500 dark:text-gray-400">Design and manage courses, subjects, and lesson plans effortlessly.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <BarChart className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Analytics & Reporting</h3>
                <p className="text-gray-500 dark:text-gray-400">Gain valuable insights with powerful reporting and data visualization tools.</p>
              </div>
            </div>
          </div>
        </section>
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
