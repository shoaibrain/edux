import { getUsersWithRoles } from "@/lib/actions/user"; // Still needed if you display user info
import { getRoles } from "@/lib/actions/role"; // Still needed if you display role info
import { enforcePermission } from "@/lib/session"; // Import enforcePermission

export default async function Schoolspage() {
  // Enforce permission to view schools.
  await enforcePermission('school:read'); 

  // You might not need these if the page only displays school-related data.
  // Keeping them for now as they were in the original snippet, but consider removing
  // if they are not used to reduce unnecessary data fetching.
  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tenant Schools or projects</h1>
        <p className="text-muted-foreground">Manage your organization schools/projects.</p>
        {/* Render school-related data here based on permissions */}
    </div>
  );
}
