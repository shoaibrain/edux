import { Separator } from "@/components/ui/separator";
import UpdateProfileForm from "./_components/update-profile-form";
import { UpdatePasswordForm } from "./_components/update-password-form";
import { DeleteAccountForm } from "./_components/delete-account-form";
import { getSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getSession();
  const currentUser = session; 

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator />
      <UpdateProfileForm user={currentUser} /> {/* Pass user to the component */}
      <UpdatePasswordForm />
      <DeleteAccountForm />
    </div>
  );
}
