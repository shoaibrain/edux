import { getUsersWithRoles } from "@/lib/actions/user";
import { getRoles } from "@/lib/actions/role";
import { enforcePermission } from "@/lib/session";

export default async function BillingPage() {
  // Enforce permission to view billing.
  await enforcePermission('tenant:view_billing'); 

  // You might not need these if the page only displays billing-related data.
  // Keeping them for now as they were in the original snippet, but consider removing
  // if they are not used to reduce unnecessary data fetching.
  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tenant Billings</h1>
        <p className="text-muted-foreground">Manage your subscriptions</p>
        {/* Render billing-related data here based on permissions */}
    </div>
  );
}
