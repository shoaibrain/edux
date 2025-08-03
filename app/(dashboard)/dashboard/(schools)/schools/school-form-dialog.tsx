"use client"

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { upsertSchoolBasicInfo } from "@/lib/actions/schools";
import { BasicInformationForm } from "./_components/forms/basic-information-form";
import { SchoolFormData } from "./_components/types/school-forms";

interface SchoolFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function SchoolFormDialog({ isOpen, setIsOpen }: SchoolFormDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formData, setFormData] = React.useState<Partial<SchoolFormData>>({
        name: "",
        email: "",
        address: "",
        phone: "",
    });
    const [errors, setErrors] = React.useState<Record<string, string[] | undefined>>({});

    const updateData = (updates: Partial<SchoolFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
        setErrors({});
    };

    const handleSaveAndContinue = async () => {
        setIsSubmitting(true);

        // FIX: Ensure required fields are not undefined before sending
        const { name, email, address, phone } = formData;
        if (!name || !email) {
            toast.error("School Name and Email are required.");
            setIsSubmitting(false);
            setErrors({
                name: !name ? ["School name is required"] : undefined,
                email: !email ? ["Email is required"] : undefined,
            });
            return;
        }

        const result = await upsertSchoolBasicInfo({ name, email, address, phone });

        if (result.success && result.school) {
            toast.success(result.message);
            setIsOpen(false);
            router.push(`/dashboard/schools/${result.school.id}/settings`);
        } else {
            toast.error(result.message);
            if (result.errors) {
                setErrors(result.errors);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Create a New School</DialogTitle>
                    <DialogDescription>
                        Start by providing the basic details. You will configure the rest in the next step.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <BasicInformationForm data={formData} updateData={updateData} errors={errors} />
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveAndContinue} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save and Continue"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
