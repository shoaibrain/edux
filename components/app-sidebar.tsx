"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Folder, Rocket } from "lucide-react"
import { useSidebar } from "./ui/sidebar"
import { cn } from "@/lib/utils"
import { UserNav } from "./user-nav"
import { type UserSession } from "@/lib/session"

interface AppSidebarProps {
  user: UserSession;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-20 flex h-screen w-full flex-col border-r",
      !isCollapsed ? "w-64" : "w-[52px]"
    )}>
        <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Rocket className="h-6 w-6" />
                {!isCollapsed && <span>EduX</span>}
            </Link>
        </div>
        <nav className="flex flex-col gap-2 p-2">
            <SidebarLink href="/dashboard" icon={<Home className="size-4" />} isCollapsed={isCollapsed}>
                Dashboard
            </SidebarLink>
            <SidebarLink href="/dashboard/users" icon={<Users className="size-4" />} isCollapsed={isCollapsed}>
                Users
            </SidebarLink>
            <SidebarLink href="/dashboard/roles" icon={<Folder className="size-4" />} isCollapsed={isCollapsed}>
                Roles
            </SidebarLink>
        </nav>
        <div className="mt-auto border-t p-2">
            <UserNav user={user} isCollapsed={isCollapsed} />
        </div>
    </aside>
  )
}

function SidebarLink({ href, icon, children, isCollapsed }: { href: string; icon: React.ReactNode; children: React.ReactNode; isCollapsed: boolean; }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary",
                isCollapsed && "justify-center"
            )}
            title={isCollapsed ? String(children) : undefined}
        >
            {icon}
            {!isCollapsed && <span className="truncate">{children}</span>}
        </Link>
    )
}