import { Sidebar } from "@/components/ui/sidebar";
import {
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar";

import { LucideIcon } from "lucide-react";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "@/app/dashboard/nav-main";
import { NavProjects } from "@/app/dashboard/nav-projects";

// Define types for the nav data
export interface NavMainItem {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string }[];
}

export interface ProjectItem {
    name: string;
    url: string;
    icon: LucideIcon;
}

export interface TeamItem {
    name: string;
    logo: LucideIcon;
    plan: string;
}

export interface NavData {
    navMain: NavMainItem[];
    projects: ProjectItem[];
    teams: TeamItem[];
}

export interface User {
    name: string;
    email: string;
    avatar: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navData: NavData;
    user: User;
}

export function AppSidebar({ navData, user, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={navData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navData.navMain} />
                <NavProjects projects={navData.projects} />
            </SidebarContent>
            <SidebarFooter>
                {/* <NavUser user={user} /> */}
                <p>Nav User</p>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}