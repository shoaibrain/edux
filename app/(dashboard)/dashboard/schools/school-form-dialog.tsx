"use client"

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { SchoolFormData } from "./_components/types/school-forms";
import { upsertSchoolAction } from "@/lib/actions/schools";
import SchoolCreationStepper from "./_components/types/school-creation-stepper";

interface SchoolFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  school?: SchoolFormData; // Optional initial data for update mode
}

export function SchoolFormDialog({ isOpen, setIsOpen, school }: SchoolFormDialogProps) {
  const mode = school ? "update" : "create";
  
  const handleSubmit = async (data: SchoolFormData) => {
    // Call the server action to upsert the school
    const result = await upsertSchoolAction(data);
    if (result.success) {
      toast.success(result.message);
      setIsOpen(false); // Close dialog on success
    } else {
      toast.error(result.message);
      // Stepper can also display validation errors, but server-side issues should be handled here.
      console.error("Server-side error submitting school form:", result.message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null; // Only render when open

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        // Make the dialog fullscreen-like (90% width/height of viewport)
        className="max-w-none w-[96vw] h-[96vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm border-0 shadow-2xl flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()} // Prevent closing on outside click for stepper
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing on escape key for stepper
      >
        {/* Custom Close Button - positioned absolutely within the dialog content */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-9 w-9 p-0 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-secondary/90 shadow-sm border border-border"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* School Creation Stepper Content */}
        <div className="flex-1 w-full h-full"> {/* Make it flexible for the stepper */}
          <SchoolCreationStepper 
            mode={mode} 
            initialData={school} // Pass initial school data for update mode
            onSubmit={handleSubmit} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
