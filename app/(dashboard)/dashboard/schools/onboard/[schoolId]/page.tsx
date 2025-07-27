import { getSchoolById } from "@/lib/actions/schools";
import { notFound } from "next/navigation";
import { SchoolSetup } from "../../_components/school-setup";

// Step 1: Update the interface to reflect that 'params' is a Promise.
interface OnboardSchoolPageProps {
  params: Promise<{
    schoolId: string;
  }>;
}

export default async function OnboardSchoolPage({ params }: OnboardSchoolPageProps) {
  // Step 2: Await the 'params' promise to resolve its value.
  const { schoolId: schoolIdString } = await params;
  
  const schoolId = Number(schoolIdString);
  if (isNaN(schoolId)) {
    notFound();
  }

  // The rest of the component logic remains the same.
  const school = await getSchoolById(schoolId);

  if (!school) {
    notFound();
  }

  return (
    <div>
      <SchoolSetup initialData={school} />
    </div>
  );
}