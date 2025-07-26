import { enforcePermission } from "@/lib/session";
import { getPeople } from "@/lib/actions/person";

import { getRoles } from "@/lib/actions/role";
import { getSchools } from "@/lib/actions/schools";
import { PeopleDataTable } from "./data-table";


export default async function PeoplePage() {
  await enforcePermission('person:read'); // Enforce permission to view people

  const [people, schools, roles] = await Promise.all([
    getPeople(),
    getSchools(), // Fetch all schools to allow selection when adding a person
    getRoles(),   // Fetch all roles to allow assignment when granting user access
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">People Management</h1>
      <p className="text-muted-foreground">Manage all individuals (students, employees, guardians) in your organization.</p>
      <PeopleDataTable data={people} allSchools={schools} allRoles={roles} />
    </div>
  );
}
