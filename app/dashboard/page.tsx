import { getSession } from "@/lib/session";
import { getTenantDb } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Folder } from "lucide-react";
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
  const session = await getSession();
  const stats = await getStats(session.tenantId);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">
        Welcome back, {session.name}! 👋
      </h1>
      <p className="text-muted-foreground">
        Here&apos;s a quick overview of your organization.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Defined Roles</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}