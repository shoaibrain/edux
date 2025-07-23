import { getSession, UserSession } from "@/lib/session"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Secures all routes under /dashboard
  const session: UserSession = await getSession();

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-muted/40">
        <AppSidebar user={session} />
        <div className="flex flex-col sm:pl-64">
           {/* You can add a header here if needed */}
          <main className="flex-1 p-4 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}