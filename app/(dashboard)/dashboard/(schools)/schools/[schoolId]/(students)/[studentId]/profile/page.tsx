// app/dashboard/schools/[schoolId]/students/[studentId]/profile/page.tsx
import { getSession, hasPermission } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { people } from '@/lib/db/schema/tenant';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';

// --- CORRECT NEXT.JS 15 TYPE DEFINITION ---
type StudentProfilePageProps = {
  params: Promise<{
    schoolId: string;
    studentId: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- Data Fetching Function ---
async function getStudentProfile(personIdParam: string, tenantId: string) {
  const personId = parseInt(personIdParam, 10);
  if (isNaN(personId)) return null;

  const db = await getTenantDb(tenantId);
  const studentProfile = await db.query.people.findFirst({
    where: eq(people.id, personId),
    with: {
      student: {
        with: {
          currentGradeLevel: true,
        },
      },
    },
  });

  if (!studentProfile || !studentProfile.student) {
    return null;
  }

  return studentProfile;
}

// --- GENERATE METADATA FUNCTION (FIXED) ---
export async function generateMetadata(
  { params }: StudentProfilePageProps
): Promise<Metadata> {
  // Await the params Promise
  const { schoolId, studentId } = await params;
  
  const session = await getSession();
  const profile = await getStudentProfile(studentId, session.tenantId);
  
  if (!profile) {
    return {
      title: 'Student Not Found',
      description: 'The requested student profile could not be found.',
    };
  }

  const studentName = `${profile.firstName} ${profile.lastName}`;
  const gradeLevel = profile.student.currentGradeLevel?.name || 'N/A';
  
  return {
    title: `${studentName} - Student Profile`,
    description: `Profile page for ${studentName}, ${gradeLevel} student with ID ${profile.student.studentId}.`,
  };
}

// --- PAGE COMPONENT (FIXED) ---
export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  // Await the params Promise  
  const { schoolId, studentId } = await params;
  
  const session = await getSession();
  
  const profile = await getStudentProfile(studentId, session.tenantId);

  if (!profile) {
    notFound();
  }

  const studentName = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={profile.profilePictureUrl ?? undefined} alt={studentName} />
          <AvatarFallback className="text-2xl">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{studentName}</h1>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Student ID: {profile.student.studentId}</span>
            <Badge variant="outline">
              {profile.student.currentGradeLevel?.name || 'N/A'}
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
            <CardTitle>Academic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Enrollment Date:</strong> {profile.student.enrollmentDate ? new Date(profile.student.enrollmentDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Notes:</strong> {profile.student.notes || 'None'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
