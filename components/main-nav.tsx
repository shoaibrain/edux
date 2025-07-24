"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Folder, Settings, type LucideIcon } from "lucide-react" // Add Settings icon

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// The icon map now includes the Settings icon
const iconMap: { [key: string]: LucideIcon } = {
  Home,
  Users,
  Folder,
  Settings,
};

// **THE FIX**: The type now correctly expects `iconName`.
interface NavItem {
  title: string;
  url: string;
  iconName: keyof typeof iconMap;
}

interface MainNavProps {
  items: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = iconMap[item.iconName];
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                <Icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  )
}