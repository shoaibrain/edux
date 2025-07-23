import { getUsersWithRoles } from "@/lib/actions/user";
import { getRoles } from "@/lib/actions/role"; // Corrected import path
import { DataTable } from "./data-table";

export default async function UsersPage() {
  // Fetch both users and roles in parallel
  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-muted-foreground mb-6">Create, edit, and manage users in your organization.</p>
      <DataTable data={users} allRoles={roles} />
    </div>
  );
}