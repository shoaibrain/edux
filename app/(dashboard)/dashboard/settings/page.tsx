import { getSession } from "@/lib/session";
import { getTenantDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema/tenant";
import { Separator } from "@/components/ui/separator";
import { UpdateProfileForm } from "./_components/update-profile-form";
import { UpdatePasswordForm } from "./_components/update-password-form";
import { DeleteAccountForm } from "./_components/delete-account-form";

// This page is automatically protected by the dashboard layout.
export default async function SettingsPage() {
  const session = await getSession();
  const db = await getTenantDb(session.tenantId);

  // We still need to fetch the specific user details for the form defaults
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!currentUser) {
    return <div>User not found in this tenant.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <UpdateProfileForm user={currentUser} />
      <Separator />
      <UpdatePasswordForm />
      <Separator />
      <DeleteAccountForm />
    </div>
  );
}