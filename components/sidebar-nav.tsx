"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavItem, iconMap } from "@/components/navigation-provider"

interface MainNavProps {
  items: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  if (!items?.length) {
    return null
  }

  return (
    <SidebarMenu>
      {items.map((item, index) => {
        const Icon = iconMap[item.iconName]
        // An item is active if the current path is the item's URL,
        // or if it's a parent path (and not the root dashboard URL).
        const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url))

        return (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              
              className="w-full justify-start"
              asChild
            >
              <Link href={item.url}>
                {Icon && <Icon className="mr-2 size-4" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}