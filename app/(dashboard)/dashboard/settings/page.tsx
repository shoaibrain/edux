import { Separator } from "@/components/ui/separator";
import UpdateProfileForm from "./_components/update-profile-form"; // Corrected to default import
import { UpdatePasswordForm } from "./_components/update-password-form";
import { DeleteAccountForm } from "./_components/delete-account-form";
import { getSession } from "@/lib/session"; // Import getSession

export default async function SettingsPage() { // Make it async to fetch session
  const session = await getSession(); // Fetch current user session
  // You can pass the user object to UpdateProfileForm if needed, e.g., to pre-fill fields
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
