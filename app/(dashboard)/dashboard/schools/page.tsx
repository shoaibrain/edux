import { getSchools } from "@/lib/actions/schools";
import { enforcePermission } from "@/lib/session";
import { SchoolsDataTable } from "./data-table";

export default async function SchoolsPage() {
  await enforcePermission('school:read'); // Enforce permission to view schools

  const schools = await getSchools(); // Fetch schools

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">School Management</h1>
      <p className="text-muted-foreground">Create and manage schools within your organization.</p>
      <SchoolsDataTable data={schools} />
    </div>
  );
}
