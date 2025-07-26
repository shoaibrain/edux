"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Folder, Settings, DollarSign, Plug, type LucideIcon } from "lucide-react" // Import DollarSign and Plug icons

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// The icon map now includes all necessary icons
const iconMap: { [key: string]: LucideIcon } = {
  Home,
  Users,
  Folder,
  Settings,
  DollarSign, // Added missing icon
  Plug,       // Added missing icon
};

interface NavItem {
  title: string;
  url: string;
  iconName: keyof typeof iconMap; // This type correctly enforces valid icon names
}

interface MainNavProps {
  items: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = iconMap[item.iconName]; // Icon will now be correctly resolved
        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.url}
              tooltip={item.title}
            >
              <Link href={item.url}>
                <Icon /> {/* This will now be a valid React component */}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  )
}
