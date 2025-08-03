"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolFormData } from "../../../_components/types/school-forms";
import {
  upsertSchoolBasicInfo,
  upsertAcademicYears,
  upsertDepartments,
  upsertGradeLevels,
} from "@/lib/actions/schools";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BasicInformationForm } from "../../../_components/forms/basic-information-form";
import { AcademicInformationForm } from "../../../_components/forms/academic-information-form";
import { DepartmentsForm } from "../../../_components/forms/departments-form";
import { GradeLevelsForm } from "../../../_components/forms/grade-levels-form";

interface SchoolSettingsFormProps {
  initialSchoolData: SchoolFormData;
}

export function SchoolSettingsForm({ initialSchoolData }: SchoolSettingsFormProps) {
  const [school, setSchool] = useState<SchoolFormData>(initialSchoolData);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const updateData = (updates: Partial<SchoolFormData>) => {
    setSchool((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const handleSave = async (section: 'basic' | 'academics' | 'departments' | 'grades') => {
    if (!school?.id) return;

    let result;
    switch (section) {
      case 'basic':
        const basicInfoData = {
            id: school.id,
            name: school.name,
            email: school.email,
            address: school.address,
            phone: school.phone,
        };
        result = await upsertSchoolBasicInfo(basicInfoData);
        break;
      case 'academics':
        result = await upsertAcademicYears(school.id, school.academicYears);
        break;
      case 'departments':
        result = await upsertDepartments(school.id, school.departments);
        break;
      case 'grades':
        result = await upsertGradeLevels(school.id, school.gradeLevels);
        break;
    }

    if (result.success) {
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully.`);
    } else {
      toast.error(result.message || `Failed to save ${section} settings.`);
      if (result.errors) {
        setErrors(result.errors);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update the basic details of the school.</CardDescription>
        </CardHeader>
        <CardContent>
          <BasicInformationForm data={school} updateData={updateData} errors={errors} />
        </CardContent>
        <div className="flex justify-end p-6">
          <Button onClick={() => handleSave('basic')}>Save Basic Information</Button>
        </div>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Define academic years and terms.</CardDescription>
        </CardHeader>
        <CardContent>
          <AcademicInformationForm data={school} updateData={updateData} errors={errors} />
        </CardContent>
        <div className="flex justify-end p-6">
          <Button onClick={() => handleSave('academics')}>Save Academic Information</Button>
        </div>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>Manage the departments in the school.</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentsForm data={school} updateData={updateData} errors={errors} />
        </CardContent>
        <div className="flex justify-end p-6">
          <Button onClick={() => handleSave('departments')}>Save Departments</Button>
        </div>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Grade Levels</CardTitle>
          <CardDescription>Define the grade levels for the school.</CardDescription>
        </CardHeader>
        <CardContent>
          <GradeLevelsForm data={school} updateData={updateData} errors={errors} />
        </CardContent>
        <div className="flex justify-end p-6">
          <Button onClick={() => handleSave('grades')}>Save Grade Levels</Button>
        </div>
      </Card>
    </div>
  );
}