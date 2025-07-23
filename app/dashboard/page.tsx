import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  // This line is the security check. 
  // It ensures a valid session exists, otherwise it redirects to login.
  // It also provides session data we can use to personalize the page.
  const session = await getSession();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold">
        Welcome back, {session.email}! 👋
      </h1>
      <p className="text-muted-foreground mt-2">
        This is your central hub for managing your organization. Use the navigation above to manage users and roles.
      </p>
    </div>
  );
}