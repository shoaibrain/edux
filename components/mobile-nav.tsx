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
  DollarSign, 
  Plug,       
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useTenant } from "@/components/tenant-provider"; 

export function MobileNav() {
    const { user: currentUserSession } = useTenant(); 

    const allNavItems = [
        { title: "Dashboard", url: "/dashboard", icon: <Home className="h-5 w-5" />, requiredPermission: 'dashboard:view' },
        { title: "People", url: "/dashboard/people", icon: <Users className="h-5 w-5" />, requiredPermission: 'person:read' }, // Updated permission to 'person:read'
        { title: "Roles", url: "/dashboard/roles", icon: <Folder className="h-5 w-5" />, requiredPermission: 'role:read' },
        { title: "Schools", url: "/dashboard/schools", icon: <Home className="h-5 w-5" />, requiredPermission: 'school:read' },
        { title: "Billings", url: "/dashboard/billing", icon: <DollarSign className="h-5 w-5" />, requiredPermission: 'tenant:view_billing' },
        { title: "Integrations", url: "/dashboard/integrations", icon: <Plug className="h-5 w-5" />, requiredPermission: 'tenant:manage' },
        { title: "Settings", url: "/dashboard/settings", icon: <Settings className="h-5 w-5" />, requiredPermission: null },
    ];

    const navItems = allNavItems.filter(item => {
        if (!item.requiredPermission) {
            return true; 
        }
        return currentUserSession.permissions.includes(item.requiredPermission);
    });

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
                {navItems.map(item => (
                    <MobileLink key={item.url} href={item.url} icon={item.icon}>
                        {item.title}
                    </MobileLink>
                ))}
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
