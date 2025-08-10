// app/(dashboard)/dashboard/(schools)/schools/[schoolId]/(people)/people/page.tsx
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default async function SchoolPeoplePage() {
  const session = await getSession();
  const canOnboardEmployee = session.permissions.includes('employee:onboard');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>
            View, add, and manage all staff members for this school.
            </CardDescription>
        </div>
        {canOnboardEmployee && (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Onboard Employee
            </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">A data table listing all staff for this school will be displayed here.</p>
      </CardContent>
    </Card>
  );
}