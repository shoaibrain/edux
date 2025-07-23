import { getRoles } from "@/lib/actions/role";
import { RolesDataTable } from "./data-table";

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Role Management</h1>
      <p className="text-muted-foreground mb-6">Create and manage roles for your organization.</p>
      <RolesDataTable data={roles} />
    </div>
  );
}