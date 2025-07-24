import { getUsersWithRoles } from "@/lib/actions/user";
import { getRoles } from "@/lib/actions/role";


export default async function Schoolspage() {
  const [users, roles] = await Promise.all([
    getUsersWithRoles(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tenant Schools  or projects</h1>
        <p className="text-muted-foreground">Manage your organization</p>
        
    </div>
  );
}