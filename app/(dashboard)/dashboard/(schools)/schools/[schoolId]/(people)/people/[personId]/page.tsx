// app/dashboard/schools/[schoolId]/staff/[staffId]/profile/page.tsx
import { getSession, hasPermission } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { people } from '@/lib/db/schema/tenant';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';

// --- CORRECT NEXT.JS 15 TYPE DEFINITION ---
type StaffProfilePageProps = {
  params: Promise<{
    schoolId: string;
    staffId: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- Data Fetching Function ---
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
  { params }: StaffProfilePageProps
): Promise<Metadata> {
  // Await the params Promise
  const { schoolId, staffId } = await params;
  
  const session = await getSession();
  const profile = await getStaffProfile(staffId, session.tenantId);
  
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

// --- PAGE COMPONENT (FIXED) ---
export default async function StaffProfilePage({ params }: StaffProfilePageProps) {
  // Await the params Promise
  const { schoolId, staffId } = await params;
  
  const session = await getSession();
  
  const profile = await getStaffProfile(staffId, session.tenantId);

  if (!profile) {
    notFound();
  }

  const staffName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={profile.profilePictureUrl ?? undefined} alt={staffName} />
          <AvatarFallback className="text-2xl">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{staffName}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>{profile.employee.position || 'Staff Member'}</span>
            <Badge variant="outline">
              {profile.employee.department?.name || 'N/A'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Email:</strong> {profile.contactEmail || 'N/A'}</p>
            <p><strong>Phone:</strong> {profile.contactPhone || 'N/A'}</p>
            <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Employee ID:</strong> {profile.employee.employeeId}</p>
            <p><strong>Hire Date:</strong> {profile.employee.hireDate ? new Date(profile.employee.hireDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Notes:</strong> {profile.employee.notes || 'None'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
