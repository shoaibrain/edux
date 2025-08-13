import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";


type SchoolClassesPageProps = {
  params: Promise<{
    schoolId: string;
  }>;
};

export default async function SchoolClassesPage({
  params,
}: SchoolClassesPageProps) {
    const { schoolId: schoolIdParam } = await params;
    const session = await getSession()
    const schoolId = parseInt(schoolIdParam, 10)

        if (isNaN(schoolId)) {
        notFound()
      }
  // Fetch classes for the school using the schoolId
  // ...

  return (
    <div>
      <h1>Classes for School ID: {schoolId}</h1>
      {/* Render the list of classes */}
    </div>
  );
}
