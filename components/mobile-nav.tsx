import Link from "next/link";
import {
  PanelLeft,
  Home,
  Users,
  Folder,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/dashboard" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                  <span className="text-lg">🚀</span>
                  <span className="sr-only">EduX</span>
                </Link>
                <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link href="/dashboard/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Users className="h-5 w-5" />
                  Users
                </Link>
                <Link href="/dashboard/roles" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                    <Folder className="h-5 w-5" />
                    Roles
                </Link>
              </nav>
            </SheetContent>
        </Sheet>
    )
}