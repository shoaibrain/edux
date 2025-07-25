import { getUsersWithRoles } from "@/lib/actions/user";
import { getRoles } from "@/lib/actions/role";
import { enforcePermission } from "@/lib/session";

export default async function IntegrationsPage() {
  // Enforce permission to manage integrations (or a more specific one if defined).
  await enforcePermission('tenant:manage'); 

  // You might not need these if the page only displays integration-related data.
  // Keeping them for now as they were in the original snippet, but consider removing
  // if they are not used to reduce unnecessary data fetching.
  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Integrations Page</h1>
        <p className="text-muted-foreground">Manage integrations</p>
        {/* Render integration-related data here based on permissions */}
    </div>
  );
}
