"use client"

import * as React from "react"
import { Rocket, PanelLeft } from "lucide-react"

import { type UserSession } from "@/lib/session"
import { useTenant } from "@/components/tenant-provider"
import { MainNav } from "./sidebar-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useNavigation } from "@/components/navigation-provider"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserSession;
}
/**
 * @param param0 - The user session object containing user permissions and details.
 * @param props - Additional props for the sidebar component.
 * @returns  - A sidebar component that displays navigation items based on user permissions.
 */
export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { user: currentUserSession } = useTenant();
  const { items: allNavItems } = useNavigation();

  console.debug("[AppSidebar] User permissions:", currentUserSession?.permissions);
  console.debug("[AppSidebar] All nav items from context:", allNavItems);

  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) {
      return true;
    }
    return currentUserSession?.permissions?.includes(item.requiredPermission);
  });

  console.log("[AppSidebar] Filtered nav items:", navItems);

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

      <SidebarFooter className="p-2 hidden md:block">
        <SidebarTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "w-full justify-start"
          )}
        >
          <PanelLeft className="mr-2 size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Collapse
          </span>
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  )
}