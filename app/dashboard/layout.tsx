import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import Link from "next/link";
import { NavItem } from "./nav-item";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/dashboard" className="font-bold text-lg">EduX Dashboard</Link>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
                <NavItem href="/dashboard/users">Users</NavItem>
                <NavItem href="/dashboard/roles">Roles</NavItem>
            </nav>
            <form action={logout}>
              <Button variant="outline" type="submit">Logout</Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}