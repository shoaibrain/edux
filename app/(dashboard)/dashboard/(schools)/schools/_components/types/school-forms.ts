export interface AcademicTerm {
  id: string;
  termName: string;
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  gradeLevels: string[];
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  yearName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  schoolId: string;
  terms: AcademicTerm[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  levelOrder: number;
  description?: string;
}

export interface BrandingConfig {
  logo?: {
    url?: string | null;
    position?: "left" | "center" | "right";
    size?: "small" | "medium" | "large";
  } | null;
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

// Remove academic year/term types since they're now managed separately
export interface SchoolFormData {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: string;
    departments: Department[];
    gradeLevels: GradeLevel[];
    academicYears: AcademicYear[];
    branding?: BrandingConfig;
    // Remove academicYears field
}

export interface Department {
    id: string;
    name: string;
    description?: string;
}

export interface GradeLevel {
    id: string;
    name: string;
    levelOrder: number;
    description?: string;
}
