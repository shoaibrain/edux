import { notFound } from "next/navigation";
import { getRoles } from "@/lib/actions/role";
import { getSchools } from "@/lib/actions/schools";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getTenantDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { people } from "@/lib/db/schema/tenant";

// Import modular form components (to be created in the next section)
// import { PersonBasicInfoForm } from "./_components/person-basic-info-form";
// import { UserAccountForm } from "./_components/user-account-form";
// import { StudentEnrollmentForm } from "./_components/student-enrollment-form";
// import { EmployeeDetailsForm } from "./_components/employee-details-form";

type PersonSettingsPageProps = {
  params: Promise<{
    schoolId: string;
    personId: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};


async function getStaffProfile(personIdParam: string, tenantId: string) {
  const personId = parseInt(personIdParam, 10);
  if (isNaN(personId)) return null;

  const db = await getTenantDb(tenantId);
  const staffProfile = await db.query.people.findFirst({
    where: eq(people.id, personId),
    with: {
      employee: {
        with: {
          department: true,
        },
      },
    },
  });

  if (!staffProfile || !staffProfile.employee) {
    return null;
  }

  return staffProfile;
}


// --- GENERATE METADATA FUNCTION (FIXED) ---
export async function generateMetadata(
  { params }: PersonSettingsPageProps
): Promise<Metadata> {
  // Await the params Promise
  const { schoolId, personId } = await params;
  
  const session = await getSession();
  const profile = await getStaffProfile(personId, session.tenantId);
  
  if (!profile) {
    return {
      title: 'Staff Not Found',
      description: 'The requested staff profile could not be found.',
    };
  }

  const staffName = `${profile.firstName} ${profile.lastName}`;
  
  return {
    title: `${staffName} - Staff Profile`,
    description: `Profile page for ${staffName}, ${profile.employee.position || 'Staff Member'} at ${profile.employee.department?.name || 'our organization'}.`,
  };
}

export default async function PersonSettingsPage({params}: PersonSettingsPageProps) {
  const { schoolId, personId } = await params;
  console.log(`[PersonSettingsPage] personId: ${personId}, tenantId: ${schoolId}`);

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-4">
        <Avatar className="h-16 w-16 border">
          {/* <AvatarImage src={person.profilePictureUrl?? undefined} alt={personName} /> */}
            <p>Person Avatar</p>
          {/* <AvatarFallback className="text-xl">{userInitial}</AvatarFallback> */}
        </Avatar>
        <div>
          {/* <h1 className="text-2xl font-bold">{personName}</h1> */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            {/* <Badge variant="outline">{person.personType}</Badge> */}
            {/* {person.school && <span>at {person.school.name}</span>} */}
            <p>Person Details</p>
          </div>
        </div>
      </header>
      <Separator />

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          {/* {isStaff(person.personType) && <TabsTrigger value="employment">Employment</TabsTrigger>} */}
          {/* {person.personType === 'Student' && <TabsTrigger value="academics">Academics</TabsTrigger>} */}
          {/* {isStaff(person.personType) && <TabsTrigger value="account-access">Account & Access</TabsTrigger>} */}
          <TabsTrigger value="account-access">Account & Access</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic-info" className="mt-4">
          {/* <PersonBasicInfoForm person={person} /> */}
          <p>Placeholder for Basic Information Form</p>
        </TabsContent>
        
        {/* {isStaff(person.personType) && ( */}
          {/* <TabsContent value="employment" className="mt-4"> */}
            {/* <EmployeeDetailsForm person={person} /> */}
            {/* <p>Placeholder for Employment Details Form</p> */}
          {/* </TabsContent> */}
        {/* )} */}
        {/* {person.personType === 'Student' && ( */}
          {/* <TabsContent value="academics" className="mt-4"> */}
            {/* <StudentEnrollmentForm person={person} /> */}
            {/* <p>Placeholder for Student Academics & Enrollment Form</p> */}
          {/* </TabsContent> */}
        {/* )} */}  

      
      </Tabs>
    </div>
  );
}