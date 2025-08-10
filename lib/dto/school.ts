import { z } from 'zod';


export const BrandingConfigSchema = z.object({
  logo: z.object({
    url: z.string().url('Invalid URL for logo.').optional().nullable(),
    position: z.enum(["left", "center", "right"], { message: "Invalid logo position." }).optional(),
    size: z.enum(["small", "medium", "large"], { message: "Invalid logo size." }).optional(),
  }).optional().nullable(),
  colors: z.object({
    primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid primary color format (e.g., #RRGGBB)."),
    secondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid secondary color format.").default("#0284c7"),
    accent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid accent color format.").default("#38bdf8"),
    background: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid background color format.").default("#ffffff"),
    text: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid text color format.").default("#1f2937"),
  }),
  typography: z.object({
    headingFont: z.string().min(1, "Heading font is required."),
    bodyFont: z.string().min(1, "Body font is required."),
    fontSize: z.enum(["small", "medium", "large"], { message: "Invalid font size." }),
  }),
  theme: z.object({
    mode: z.enum(["light", "dark", "auto"], { message: "Invalid theme mode." }),
    borderRadius: z.enum(["none", "small", "medium", "large"], { message: "Invalid border radius." }),
    shadows: z.boolean(),
  }),
  layout: z.object({
    sidebarPosition: z.enum(["left", "right"], { message: "Invalid sidebar position." }),
    headerStyle: z.enum(["minimal", "standard", "prominent"], { message: "Invalid header style." }),
    cardStyle: z.enum(["flat", "elevated", "outlined"], { message: "Invalid card style." }),
  }),
});

// EXPORT this schema
export const AcademicTermSchema = z.object({
    id: z.string().optional(),
    termName: z.string().min(1, "Term name is required."),
    startDate: z.string().min(1, "Start date is required.").refine(dateString => !isNaN(new Date(dateString).getTime()), "Invalid term start date."),
    endDate: z.string().min(1, "End date is required.").refine(dateString => !isNaN(new Date(dateString).getTime()), "Invalid term end date."),
    isCurrent: z.boolean(),
});

// EXPORT this schema
export const AcademicYearSchema = z.object({
  id: z.string().optional(), // Stepper uses string IDs for new items
  yearName: z.string().min(1, "Year name is required."),
  startDate: z.string().min(1, "Start date is required.").refine(dateString => !isNaN(new Date(dateString).getTime()), "Invalid start date."),
  endDate: z.string().min(1, "End date is required.").refine(dateString => !isNaN(new Date(dateString).getTime()), "Invalid end date."),
  isCurrent: z.boolean(),
  terms: z.array(AcademicTermSchema).min(1, "At least one academic term is required."),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: "Start date must be before end date for academic year.",
  path: ["endDate"],
});

// EXPORT this schema
export const DepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Department name is required."),
  description: z.string().optional(),
});

// EXPORT this schema
export const GradeLevelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Grade level name is required."),
  levelOrder: z.number().int().min(0, "Level order must be 0 or greater."),
  description: z.string().optional(),
});

// EXPORT this schema for the basic info step
export const BasicInfoSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: 'School name must be at least 3 characters.' }).max(100),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: 'Invalid email address.' }),
});

export const SchoolFormSchema = z.object({
  id: z.number().optional(),
  // Step 1: Basic Information
  name: z.string().min(3, { message: 'School name must be at least 3 characters.' }).max(100),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: 'Invalid email address.' }),

  // Step 2: Academic Information
  academicYears: z.array(AcademicYearSchema).min(1, "At least one academic year is required."),

  // Step 3: Departments
  departments: z.array(DepartmentSchema).min(1, "At least one department is required."),

  // Step 4: Grade Levels
  gradeLevels: z.array(GradeLevelSchema).min(1, "At least one grade level is required."),

  // Step 5: Branding
  website: z.string().url({ message: 'Invalid URL.' }).optional().nullable(),
  logoUrl: z.string().url({ message: 'Invalid URL.' }).optional().nullable(),
  // MAKE BRANDING OPTIONAL
  branding: BrandingConfigSchema.optional(),
});

export type SchoolFormInput = z.infer<typeof SchoolFormSchema>;
