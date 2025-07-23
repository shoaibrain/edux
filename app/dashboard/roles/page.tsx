import { getRoles } from "@/lib/actions/role";
import { RolesDataTable } from "./data-table";

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Role Management</h1>
      <p className="text-muted-foreground">Create and manage roles for your organization.</p>
      <RolesDataTable data={roles} />
    </div>
  );
}