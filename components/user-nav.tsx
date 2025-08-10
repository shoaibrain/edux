"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from "@/lib/actions/auth"
import type { UserSession } from "@/lib/session"
import { Moon, Sun } from "lucide-react"

interface NavUserProps {
  user: UserSession;
}

export function NavUser({ user }: NavUserProps) {
    const { setTheme } = useTheme()
    const userInitial = user.name?.charAt(0).toUpperCase() || 'A';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Updated trigger to be a simple avatar button for the header */}
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`data:image/png;base64,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`} alt={user.name || ''} />
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Theme Toggle Submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <form action={logout} className="w-full">
                    <button type="submit" className="w-full text-left relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                        Logout
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}