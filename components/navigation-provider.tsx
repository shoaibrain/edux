"use client";

import * as React from "react";
import { 
  Home, Users, Folder, DollarSign, Plug, Settings, BookOpen, 
  Calendar, UserCheck, Building, GraduationCap, ClipboardList 
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  iconName: IconName;
  requiredPermission: string | null;
}
// Centralized map of all icons used for navigation
export const iconMap = {
  Home,
  Users,
  Folder,
  DollarSign,
  Plug,
  Settings,
  BookOpen,       // For Academics
  Calendar,       // For Calendar
  UserCheck,      // For Staff
  Building,       // For Departments
  GraduationCap,  // For Students
  ClipboardList,  // For Classes
};

export type IconName = keyof typeof iconMap;



interface NavigationContextType {
  items: NavItem[];
}

const NavigationContext = React.createContext<NavigationContextType | undefined>(
  undefined
);

export function NavigationProvider({
  children,
  initialItems = [],
}: {
  children: React.ReactNode;
  initialItems?: NavItem[];
}) {
  const [items] = React.useState<NavItem[]>(initialItems);

  return (
    <NavigationContext.Provider value={{ items }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = React.useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}