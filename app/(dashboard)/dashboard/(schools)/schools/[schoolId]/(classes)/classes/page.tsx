import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { ClassClientActions } from "./_components/class-client-actions";
import { getDummyClassPrerequisites } from "@/lib/fixtures/class-prereq";


type SchoolClassesPageProps = {
  params: Promise<{
    schoolId: string;
  }>;
};

export default async function SchoolClassesPage({ params }: SchoolClassesPageProps) {
  const { schoolId: schoolIdParam } = await params;

  if (!schoolIdParam) {
    notFound();
  }

  // UI-only milestone: use dummy data for prerequisites
  const prerequisites = getDummyClassPrerequisites(schoolIdParam);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Class Management</CardTitle>
            <CardDescription>
              Schedule and manage all class periods for this school.
            </CardDescription>
          </div>
          <ClassClientActions schoolId={schoolIdParam} initialPrerequisites={prerequisites} />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A data table listing all scheduled classes will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
