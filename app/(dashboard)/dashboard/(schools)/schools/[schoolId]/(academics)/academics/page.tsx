import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchoolAcademicsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Academics</CardTitle>
        <CardDescription>
          Manage academic years, terms, departments, courses, and class schedules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                    <CardTitle>Academic Years & Terms</CardTitle>
                    <CardDescription>Define the schools calendar and grading periods.</CardDescription>
                </CardHeader>
            </Card>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                    <CardTitle>Departments & Courses</CardTitle>
                    <CardDescription>Manage the course catalog and subject areas.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
}