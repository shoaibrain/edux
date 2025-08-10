import { enforcePermission } from "@/lib/session";
import { getPeople } from "@/lib/actions/person";

import { getRoles } from "@/lib/actions/role";
import { getSchools } from "@/lib/actions/schools";
import { PeopleDataTable } from "./data-table";


export default async function PeoplePage() {
  await enforcePermission('person:read');

  const [people, schools, roles] = await Promise.all([
    getPeople(),
    getSchools(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">People Management</h1>
      <p className="text-muted-foreground">Manage your system users.</p>
      <PeopleDataTable data={people} allSchools={schools} allRoles={roles} />
    </div>
  );
}
