// app/(dashboard)/dashboard/(schools)/schools/[schoolId]/(students)/students/page.tsx
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// This Server Component will eventually fetch a list of students for the specific school.
export default async function SchoolStudentsPage() {
  const session = await getSession();
  const canAdmitStudent = session.permissions.includes('student:admit');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>
            View, add, and manage all students for this school.
            </CardDescription>
        </div>
        {canAdmitStudent && (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Admit Student
            </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">A data table listing all students for this school will be displayed here.</p>
      </CardContent>
    </Card>
  );
}