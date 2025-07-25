import { getUsersWithRoles } from "@/lib/actions/user";
import { getRoles } from "@/lib/actions/role";
import { DataTable } from "./data-table";
import { enforcePermission } from "@/lib/session";

export default async function UsersPage() {
  await enforcePermission('user:read'); // Enforce permission to view users

  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage users in your organization.</p>
        <DataTable data={users} allRoles={roles} />
    </div>
  );
}
