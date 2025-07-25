"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeft,
  Rocket,
  Home,
  Users,
  Folder,
  Settings,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0">
              <nav className="grid gap-6 text-lg font-medium p-4">
                <Link href="/dashboard" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
                  <Rocket className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">EduX</span>
                </Link>
                <MobileLink href="/dashboard" icon={<Home className="h-5 w-5" />}>Dashboard</MobileLink>
                <MobileLink href="/dashboard/users" icon={<Users className="h-5 w-5" />}>Users</MobileLink>
                <MobileLink href="/dashboard/roles" icon={<Folder className="h-5 w-5" />}>Roles</MobileLink>
                <MobileLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>Settings</MobileLink>
              </nav>
            </SheetContent>
        </Sheet>
    )
}

function MobileLink({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center gap-4 px-2.5 hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground",
            )}
        >
            {icon}
            {children}
        </Link>
    )
}