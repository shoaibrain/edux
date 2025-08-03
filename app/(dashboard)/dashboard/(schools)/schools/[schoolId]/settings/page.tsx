import { getSchoolById } from "@/lib/actions/schools";
import { notFound } from "next/navigation";
import { SchoolSettingsForm } from "./_components/school-settings-form";


// Step 1: Update the interface to reflect that 'params' is a Promise.
interface SchoolSettingspageProps {
  params: Promise<{
    schoolId: string;
  }>;
}

export default async function SchoolSettingspage({ params }: SchoolSettingspageProps) {
  // Step 2: Await the 'params' promise to resolve its value.
  const { schoolId: schoolIdString } = await params;
  
  const schoolId = Number(schoolIdString);
  if (isNaN(schoolId)) notFound();

  const schoolData = await getSchoolById(schoolId);
  if (!schoolData) notFound();
  console.log("School Data:", schoolData);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">School Settings</h1>
            <p className="text-muted-foreground">Manage settings for {schoolData.name}.</p>
        </div>
        <SchoolSettingsForm initialSchoolData={schoolData} />
    </div>
  );
}