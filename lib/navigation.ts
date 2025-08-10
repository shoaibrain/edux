import { NavItem } from "@/components/navigation-provider";
import { UserSession, hasPermission } from "@/lib/session";

/**
 * Generates and filters navigation items for the tenant context based on user permissions.
 * @param user - The user session object.
 * @returns An array of NavItem objects for the tenant sidebar.
 */
export const getTenantNavItems = (user: UserSession): NavItem[] => {
  const allItems: NavItem[] = [
    { title: "Dashboard", url: "/dashboard", iconName: "Home", requiredPermission: 'dashboard:view' },
    { title: "People", url: "/dashboard/people", iconName: "Users", requiredPermission: 'person:read' },
    { title: "Roles", url: "/dashboard/roles", iconName: "Folder", requiredPermission: 'role:read' },
    { title: "Schools", url: "/dashboard/schools", iconName: "Home", requiredPermission: 'school:read' },
    { title: "Billings", url: "/dashboard/billing", iconName: "DollarSign", requiredPermission: 'tenant:view_billing' },
    { title: "Integrations", url: "/dashboard/integrations", iconName: "Plug", requiredPermission: 'tenant:manage' },
    { title: "Settings", url: "/dashboard/settings", iconName: "Settings", requiredPermission: 'tenant:manage_settings' },
  ];

  // Filter items based on the user's permissions
  return allItems.filter(item => {
    if (!item.requiredPermission) {
      return true; // Always show items that don't require a permission
    }
    return user?.permissions?.includes(item.requiredPermission) ?? false;
  });
};


/**
 * Generates and filters navigation items for the school context based on user permissions.
 * @param schoolId - The ID of the current school.
 * @param user - The user session object.
 * @returns An array of NavItem objects for the school sidebar.
 */
export const getSchoolNavItems = (schoolId: string, user: UserSession): NavItem[] => {
  const allItems: NavItem[] = [
    {
        title: "School Dashboard",
        url: `/dashboard/schools/${schoolId}`,
        iconName: "Home",
        requiredPermission: "school:read",
    },
    {
        title: "Students",
        url: `/dashboard/schools/${schoolId}/students`,
        iconName: "GraduationCap",
        requiredPermission: "student:read",
    },
    {
        title: "Staff",
        url: `/dashboard/schools/${schoolId}/staff`,
        iconName: "UserCheck",
        requiredPermission: "staff:read",
    },
    {
        title: "Academics",
        url: `/dashboard/schools/${schoolId}/academics`,
        iconName: "BookOpen",
        requiredPermission: "academics:read",
    },
    {
        title: "School Settings",
        url: `/dashboard/schools/${schoolId}/settings`,
        iconName: "Settings",
        requiredPermission: "school:manage_settings",
    },
  ];

  // Filter items based on the user's permissions
  return allItems.filter(item => {
    if (!item.requiredPermission) {
      return true; // Always show items that don't require a permission
    }
    return user?.permissions?.includes(item.requiredPermission) ?? false;
  });
};