"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export const useSidebar = () => React.useContext(SidebarContext)

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode
  defaultCollapsed?: boolean
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div data-collapsed={isCollapsed} className={cn(
        "grid h-full grid-cols-[var(--sidebar-width)_1fr]",
        "data-[collapsed=true]:grid-cols-[var(--sidebar-collapsed-width)_1fr]",
        "transition-all duration-300 ease-in-out"
      )}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export const Sidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <aside
        ref={ref}
        data-collapsed={isCollapsed}
        className={cn(
          "fixed top-0 left-0 z-20 h-screen -translate-x-full sm:translate-x-0 border-r",
          "w-[var(--sidebar-width)] data-[collapsed=true]:w-[var(--sidebar-collapsed-width)]",
          "transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      />
    )
  }
)
Sidebar.displayName = "Sidebar"


export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <div
        ref={ref}
        data-collapsed={isCollapsed}
        className={cn(
          "ml-[var(--sidebar-width)] data-[collapsed=true]:ml-[var(--sidebar-collapsed-width)]",
          "transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = "SidebarInset"