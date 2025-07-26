export interface AcademicTerm {
  id?: string; // Client-side generated ID for dynamic lists
  termName: string;
  startDate: string; // Stored as YYYY-MM-DD string for input[type=date]
  endDate: string; // Stored as YYYY-MM-DD string
  isCurrent: boolean;
}

export interface AcademicYear {
  id?: string; // Client-side generated ID for dynamic lists
  yearName: string;
  startDate: string; // Stored as YYYY-MM-DD string
  endDate: string; // Stored as YYYY-MM-DD string
  isCurrent: boolean;
  terms: AcademicTerm[];
}

export interface Department {
  id?: string; // Client-side generated ID for dynamic lists
  name: string;
  description?: string; // Made optional as per Zod schema in lib/dto/school
}

export interface GradeLevel {
  id?: string; // Client-side generated ID for dynamic lists
  name: string;
  levelOrder: number;
  description?: string; // Made optional
}

export interface BrandingConfig {
  logo?: { // Logo details for branding
    url?: string | null;
    position?: "left" | "center" | "right";
    size?: "small" | "medium" | "large";
  } | null; // Can be null or undefined if no logo
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: "small" | "medium" | "large";
  };
  theme: {
    mode: "light" | "dark" | "auto";
    borderRadius: "none" | "small" | "medium" | "large";
    shadows: boolean;
  };
  layout: {
    sidebarPosition: "left" | "right";
    headerStyle: "minimal" | "standard" | "prominent";
    cardStyle: "flat" | "elevated" | "outlined";
  };
}

export interface SchoolFormData {
  id?: number; // Database ID, present in update mode
  // Step 1: Basic Information
  name: string;
  address?: string | null;
  phone?: string | null;
  email: string; // Required per prototype

  // Step 2: Academic Information
  academicYears: AcademicYear[];

  // Step 3: Departments
  departments: Department[];

  // Step 4: Grade Levels
  gradeLevels: GradeLevel[];

  // Step 5: Branding
  website?: string | null;
  logoUrl?: string | null;
  branding: BrandingConfig;
}