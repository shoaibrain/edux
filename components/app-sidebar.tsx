"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Rocket, Home, Users, Folder, Settings } from "lucide-react"

import { type UserSession } from "@/lib/session"

import { MainNav } from "./main-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "./user-nav"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserSession;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { state: sidebarState } = useSidebar(true);
  const isCollapsed = sidebarState === 'collapsed';

  const navItems = [
    { title: "Dashboard", url: "/dashboard", iconName: "Home" as const },
    { title: "Users", url: "/dashboard/users", iconName: "Users" as const },
    { title: "Roles", url: "/dashboard/roles", iconName: "Folder" as const },
    { title: "Settings", url: "/dashboard/settings", iconName: "Settings" as const },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Rocket className="size-4" />
                </div>
                {/* **THE FIX**: This div now correctly handles the collapsed state */}
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">EduX</span>
                  <span className="text-xs text-muted-foreground">Tenant Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}