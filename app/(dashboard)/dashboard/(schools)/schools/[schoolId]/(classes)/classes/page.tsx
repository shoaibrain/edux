import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrerequisitesForClassForm } from "@/lib/actions/class";
import { enforcePermission, getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { ClassClientActions } from "./_components/class-client-actions";


type SchoolClassesPageProps = {
  params: Promise<{
    schoolId: string;
  }>;
};

export default async function SchoolClassesPage({
  params,
}: SchoolClassesPageProps) {
    const { schoolId: schoolIdParam } = await params;
    await enforcePermission('class:manage');
    const session = await getSession();
    const schoolId = parseInt(schoolIdParam, 10)

        if (isNaN(schoolId)) {
        notFound()
      }

const prerequisites = await getPrerequisitesForClassForm(schoolId);

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
            <ClassClientActions schoolId={schoolId} initialPrerequisites={prerequisites} />
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
