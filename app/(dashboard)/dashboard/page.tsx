import { getSession } from "@/lib/session";
import { getTenantDb } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Folder, Building, UserCircle } from "lucide-react";
import { sql } from "drizzle-orm";


async function getStats(tenantId: string) {
    const db = await getTenantDb(tenantId);
    const userCountResult = await db.execute(sql`SELECT COUNT(*) FROM users;`);
    const roleCountResult = await db.execute(sql`SELECT COUNT(*) FROM roles;`);
    const userCount = Number((userCountResult.rows[0] as { count: string }).count);
    const roleCount = Number((roleCountResult.rows[0] as { count: string }).count);
    return { userCount, roleCount };
}

export default async function DashboardPage() {
  // The layout already secures the page, but we get the session here
  // to access the data for rendering.
  const session = await getSession();
  const stats = await getStats(session.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your organization&apos;s activity.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle>Welcome, {session.name}!</CardTitle>
            <CardDescription>You are currently logged in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-medium">{session.userId}</span>
            </div>
            <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Organization:</span>
                <span className="font-medium">{session.tenantId}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">managed within this tenant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defined Roles</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleCount}</div>
            <p className="text-xs text-muted-foreground">available for assignment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}