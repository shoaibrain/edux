import { getRoles } from "@/lib/actions/role";
import { RolesDataTable } from "./data-table";
import { enforcePermission } from "@/lib/session"; // Import enforcePermission

export default async function RolesPage() {
  // Enforce permission to view roles. If the user doesn't have 'role:read',
  // they will be redirected by the enforcePermission function.
  await enforcePermission('role:read'); 
  
  // Fetch roles after permission check.
  const roles = await getRoles();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Role Management</h1>
      <p className="text-muted-foreground">Create and manage roles for your organization.</p>
      <RolesDataTable data={roles} />
    </div>
  );
}
