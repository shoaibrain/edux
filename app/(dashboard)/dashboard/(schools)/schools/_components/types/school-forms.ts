export interface AcademicTerm {
  id?: string;
  termName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicYear {
  id?: string;
  yearName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: AcademicTerm[];
}

export interface Department {
  id?: string;
  name: string;
  description?: string;
}

export interface GradeLevel {
  id?: string;
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

export interface SchoolFormData {
  id?: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  email: string;
  academicYears: AcademicYear[];
  departments: Department[];
  gradeLevels: GradeLevel[];
  website?: string | null;
  logoUrl?: string | null;
  branding?: BrandingConfig;
}
