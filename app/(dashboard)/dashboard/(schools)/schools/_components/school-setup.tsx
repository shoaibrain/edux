"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SchoolFormData } from "./types/school-forms";
import {
    upsertAcademicYears,
    upsertDepartments,
    upsertGradeLevels
} from "@/lib/actions/schools";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { AcademicInformationForm } from "./forms/academic-information-form";
import { DepartmentsForm } from "./forms/departments-form";
import { GradeLevelsForm } from "./forms/grade-levels-form";
import { Check, ChevronLeft, School, GraduationCap, Building, ListOrdered } from "lucide-react";

interface SchoolSetupProps {
    initialData: SchoolFormData;
}

const steps = [
    { id: 1, title: "Basic Information", icon: School },
    { id: 2, title: "Academic Information", icon: GraduationCap },
    { id: 3, title: "Departments", icon: Building },
    { id: 4, title: "Grade Levels", icon: ListOrdered },
];

const totalSteps = steps.length;

type ActionResult = {
    success: boolean;
    message: string;
    errors?: Record<string, string[] | undefined>;
};

export function SchoolSetup({ initialData }: SchoolSetupProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState<SchoolFormData>(initialData);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // FIX: Provide a specific type for Zod field errors
    const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

    useEffect(() => {
        const step = searchParams.get("step");
        const initialStep = initialData.id ? (step ? Number(step) : 2) : 1;
        setCurrentStep(initialStep);
    }, [searchParams, initialData.id]);

    const updateData = (updates: Partial<SchoolFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        const newErrors = { ...errors };
        Object.keys(updates).forEach(key => delete newErrors[key]);
        setErrors(newErrors);
    };

    const handleNext = async () => {
        setIsSubmitting(true);
        setErrors({});
        // FIX: Use the specific ActionResult type
        let result: ActionResult | undefined;

        switch (currentStep) {
            case 2:
                result = await upsertAcademicYears(formData.id!, formData.academicYears);
                if (result.success) goToStep(3);
                break;
            case 3:
                result = await upsertDepartments(formData.id!, formData.departments);
                if (result.success) goToStep(4);
                break;
            case 4:
                result = await upsertGradeLevels(formData.id!, formData.gradeLevels);
                if (result.success) {
                    toast.success("School setup complete!");
                    router.push('/dashboard/schools');
                }
                break;
            default:
                goToStep(currentStep + 1);
        }

        if (result && !result.success) {
            toast.error(result.message);
            if(result.errors) setErrors(result.errors);
        }
        setIsSubmitting(false);
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
        router.push(`?step=${step}`, { scroll: false });
    };

    const handlePrevious = () => {
        if (currentStep > 2) {
            goToStep(currentStep - 1);
        } else {
            router.push('/dashboard/schools');
        }
    }

    const renderCurrentForm = () => {
        const commonProps = { data: formData, updateData, errors };
        switch (currentStep) {
            case 2: return <AcademicInformationForm {...commonProps} />;
            case 3: return <DepartmentsForm {...commonProps} />;
            case 4: return <GradeLevelsForm {...commonProps} />;
            default: return <AcademicInformationForm {...commonProps} />;
        }
    };

    const progress = ((currentStep - 1) / totalSteps) * 100;
    const currentStepData = steps[currentStep - 1];

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Onboard {initialData.name}</h1>
                <p className="mt-2 text-lg text-gray-600">Follow the steps to complete the setup for your new school.</p>
            </div>

            <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between">
                    {steps.map(step => (
                        <div key={step.id} className="text-center">
                            <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                                {currentStep > step.id ? <Check className="h-5 w-5"/> : <step.icon className="h-5 w-5"/>}
                            </div>
                            <p className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{currentStepData.title}</CardTitle>
                    <CardDescription>
                        Configure the {currentStepData.title.toLowerCase()} for {formData.name}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderCurrentForm()}
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4 mr-2"/>
                    {currentStep === 2 ? "Back to Schools" : "Previous"}
                </Button>
                <Button onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (currentStep === totalSteps ? "Finish Setup" : "Save and Continue")}
                </Button>
            </div>
        </div>
    );
}
