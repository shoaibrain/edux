import {getSession, UserSession} from "@/lib/session"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/breadcrumbs";
import { Separator } from "@/components/ui/separator";


interface DashboardLayoutProps {
  children: React.ReactNode;
}
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();
  // Compute nav data based on session (tenant/role-aware)
  // This should be a function that returns sidebar nav data to create a sidebar nav for current logged in user.
 // This is role based access, meaning based on the business logic, user roles, different navData willl be presented 
 // for users. For example: When Tenant Admin logs in, in the sidebar nav, the tenant should see options like Users, Roles, Students, etc.... (Tenant Admin has highest Access)  
 // Tenant admin will also see option for settings on the sidebar nav, where it will take to tenant admin specific setting. But when User like Teacher logs in or , Student logs in,
 // they all will see distinct sidebar navs. An enterprise grade multi tenant saas applicaiton, dashbaord, dynamic, tenent context aware, secure and enterprise grade implementation.    
  const navData = await getDashboardNavData(session);
  return (
      <SidebarProvider>
        <AppSidebar
            navData={navData}
            user={{
              name: session.name,
              email: session.email,
              avatar:"/public/notion-avatar-1753323104262.png", // use default png avatar (relative oatg):public/notion-avatar-1753323104262.png
            }}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{/* You can pass current page title here dynamically */}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main className="flex-1 flex flex-col gap-4 p-4 pt-0">{children}</main>
        </SidebarInset>
      </SidebarProvider>
  );
}
// You need to implement getDashboardNavData
async function getDashboardNavData(session: UserSession) {
  // Return navMain, projects, teams based on session.user.role, session.tenant, etc.
  // This is pseudo-logic, implement as per your needs
  return {
    navMain: [],
    projects: [],
    teams: [],
  }
}