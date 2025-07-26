"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  AlertCircle,
  School,
  GraduationCap,
  BarChart3,
  AudioLines,
  Eye,
} from "lucide-react"
import { SchoolFormData } from "./school-forms"
import { BasicInformationForm } from "../forms/basic-information-form"
import { AcademicInformationForm } from "../forms/academic-information-form"
import { DepartmentsForm } from "../forms/departments-form"
import { GradeLevelsForm } from "../forms/grade-levels-form"
import { BrandingForm } from "../forms/branding-form"



interface SchoolCreationStepperProps {
  mode?: "create" | "update"
  initialData?: Partial<SchoolFormData>
  onSubmit?: (data: SchoolFormData) => void
}

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Essential school details",
    icon: School,
  },
  {
    id: 2,
    title: "Academic Information",
    description: "Academic years and terms",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Departments",
    description: "School departments",
    icon: BarChart3,
  },
  {
    id: 4,
    title: "Grade Levels",
    description: "Grade structure",
    icon: AudioLines,
  },
  {
    id: 5,
    title: "Branding & Personalization",
    description: "Customize appearance",
    icon: Eye,
  },
]

export default function SchoolCreationStepper({
  mode = "create",
  initialData = {},
  onSubmit,
}: SchoolCreationStepperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    academicYears: [],
    departments: [],
    gradeLevels: [],
    website: "",
    logoUrl: "",
    branding: {
      colors: {
        primary: "#0ea5e9",
        secondary: "#0284c7",
        accent: "#38bdf8",
        background: "#ffffff",
        text: "#1f2937",
      },
      typography: {
        headingFont: "Inter, sans-serif",
        bodyFont: "Inter, sans-serif",
        fontSize: "medium",
      },
      theme: {
        mode: "light",
        borderRadius: "medium",
        shadows: true,
      },
      layout: {
        sidebarPosition: "left",
        headerStyle: "standard",
        cardStyle: "elevated",
      },
    },
    ...initialData,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = steps.length
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (updates: Partial<SchoolFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    const newErrors = { ...errors }
    Object.keys(updates).forEach((key) => {
      if (newErrors[key]) {
        delete newErrors[key]
      }
    })
    setErrors(newErrors)
  }

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {}

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "School name is required"
        }
        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email address"
        }
        break
      case 2:
        if (formData.academicYears.length === 0) {
          newErrors.academicYears = "At least one academic year is required"
        }
        // Add more detailed academic year/term validation if needed
        formData.academicYears.forEach((year, yearIndex) => {
          if (!year.yearName.trim()) {
            newErrors[`academicYears[${yearIndex}].yearName`] = "Year name is required";
          }
          if (!year.startDate.trim()) {
            newErrors[`academicYears[${yearIndex}].startDate`] = "Start date is required";
          }
          if (!year.endDate.trim()) {
            newErrors[`academicYears[${yearIndex}].endDate`] = "End date is required";
          }
          if (new Date(year.startDate) >= new Date(year.endDate)) {
            newErrors[`academicYears[${yearIndex}].endDate`] = "End date must be after start date";
          }
          if (year.terms.length === 0) {
            newErrors[`academicYears[${yearIndex}].terms`] = "At least one term is required for this year";
          }
          year.terms.forEach((term, termIndex) => {
            if (!term.termName.trim()) {
              newErrors[`academicYears[${yearIndex}].terms[${termIndex}].termName`] = "Term name is required";
            }
            if (!term.startDate.trim()) {
              newErrors[`academicYears[${yearIndex}].terms[${termIndex}].startDate`] = "Term start date is required";
            }
            if (!term.endDate.trim()) {
              newErrors[`academicYears[${yearIndex}].terms[${termIndex}].endDate`] = "Term end date is required";
            }
            if (new Date(term.startDate) >= new Date(term.endDate)) {
              newErrors[`academicYears[${yearIndex}].terms[${termIndex}].endDate`] = "Term end date must be after start date";
            }
          });
        });
        break
      case 3:
        if (formData.departments.length === 0) {
          newErrors.departments = "At least one department is required"
        }
        formData.departments.forEach((dept, index) => {
          if (!dept.name.trim()) {
            newErrors[`departments[${index}].name`] = "Department name is required";
          }
        });
        break
      case 4:
        if (formData.gradeLevels.length === 0) {
          newErrors.gradeLevels = "At least one grade level is required"
        }
        formData.gradeLevels.forEach((grade, index) => {
          if (!grade.name.trim()) {
            newErrors[`gradeLevels[${index}].name`] = "Grade name is required";
          }
          if (grade.levelOrder === null || grade.levelOrder === undefined) {
            newErrors[`gradeLevels[${index}].levelOrder`] = "Order is required";
          } else if (grade.levelOrder < 0) {
            newErrors[`gradeLevels[${index}].levelOrder`] = "Order must be non-negative";
          }
        });
        break
      case 5:
        if (formData.website && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(formData.website)) {
          newErrors.website = "Please enter a valid website URL";
        }
        if (formData.logoUrl && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(formData.logoUrl)) {
          newErrors.logoUrl = "Please enter a valid logo URL";
        }
        // Basic color format validation
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(formData.branding.colors.primary)) newErrors.primaryColor = "Invalid primary color";
        if (!colorRegex.test(formData.branding.colors.secondary)) newErrors.secondaryColor = "Invalid secondary color";
        if (!colorRegex.test(formData.branding.colors.accent)) newErrors.accentColor = "Invalid accent color";
        if (!colorRegex.test(formData.branding.colors.background)) newErrors.backgroundColor = "Invalid background color";
        if (!colorRegex.test(formData.branding.colors.text)) newErrors.textColor = "Invalid text color";

        break;
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (!validateCurrentStep()) {
      return
    }

    if (onSubmit) {
      onSubmit(formData)
    }
  }

  const renderCurrentForm = () => {
    const commonProps = {
      data: formData,
      updateData: updateFormData,
      errors,
    }

    switch (currentStep) {
      case 1:
        return <BasicInformationForm {...commonProps} />
      case 2:
        return <AcademicInformationForm {...commonProps} />
      case 3:
        return <DepartmentsForm {...commonProps} />
      case 4:
        return <GradeLevelsForm {...commonProps} />
      case 5:
        return <BrandingForm {...commonProps} />
      default:
        return null
    }
  }

  const currentStepData = steps[currentStep - 1]

  const handleStepClick = (stepId: number) => {
    // Allow clicking on already completed steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      return;
    }
    // Allow clicking on the next step only if current step is valid
    if (stepId === currentStep + 1) {
      if (validateCurrentStep()) {
        setCurrentStep(stepId);
      }
    }
    // Disallow jumping steps
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="mx-auto mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {mode === "create" ? "Create Your School" : "Update School Settings"}
          </h1>
          <p className="mt-1 sm:mt-2 text-gray-600 text-sm">
            {mode === "create"
              ? "Set up your school profile with comprehensive details"
              : "Modify your school configuration and settings"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto px-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    // Disable future steps if previous are not complete, allow navigation to past steps
                    disabled={step.id > currentStep + 1 && !Object.keys(errors).length === 0} 
                    className={`relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      currentStep >= step.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        : step.id === currentStep + 1
                          ? "border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
                          : "border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-3 w-3 sm:h-4 w-4" />
                    ) : (
                      <step.icon className="h-3 w-3 sm:h-4 w-4" />
                    )}
                    {currentStep === step.id && (
                      <div className="absolute -inset-1 rounded-full border-2 border-blue-300 animate-pulse"></div>
                    )}
                  </button>
                  <div className="mt-1 sm:mt-2 text-center max-w-[80px] sm:max-w-[100px]">
                    <span
                      className={`text-xs font-medium block leading-tight ${
                        currentStep >= step.id
                          ? "text-blue-600"
                          : step.id === currentStep + 1
                            ? "text-blue-500"
                            : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 hidden lg:block leading-tight">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-3 mt-[-12px] sm:mt-[-16px]">
                    <div
                      className={`h-0.5 w-full transition-colors duration-300 ${
                        currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Please fix the errors below before proceeding to the next step.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8">
        <Card className="h-full flex flex-col shadow-xl border-0">
          <CardHeader className="flex-shrink-0 pb-3 sm:pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <currentStepData.icon className="h-4 w-4 sm:h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">{currentStepData.title}</CardTitle>
                <CardDescription className="text-sm">{currentStepData.description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto pb-0">
            <div className="min-h-full">{renderCurrentForm()}</div>
          </CardContent>

          {/* Navigation - Fixed at bottom */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-b-lg border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 bg-transparent"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs">
                {currentStep} / {totalSteps}
              </Badge>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="flex items-center gap-2" size="sm">
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">{mode === "create" ? "Create School" : "Update School"}</span>
                  <span className="sm:hidden">{mode === "create" ? "Create" : "Update"}</span>
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom padding */}
      <div className="flex-shrink-0 h-4 sm:h-6"></div>
    </div>
  );
}