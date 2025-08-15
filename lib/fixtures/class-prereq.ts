import type { Prerequisites } from '@/lib/dto/class-ui';

export function getDummyClassPrerequisites(schoolId: string): Prerequisites {
  // In a real app, this would be fetched from an API. For UI-only milestone, this is hardcoded.
  const departments = [
    { id: 'dept-math', name: 'Mathematics' },
    { id: 'dept-sci', name: 'Science' },
    { id: 'dept-eng', name: 'English' },
    { id: 'dept-hist', name: 'History' },
  ];

  const academicTerms = [
    { id: 'term-2024-fall', name: 'Fall 2024', yearName: '2024-2025', startDate: '2024-08-19' },
    { id: 'term-2025-spring', name: 'Spring 2025', yearName: '2024-2025', startDate: '2025-01-06' },
  ];

  const gradeLevels = [
    { id: 'grade-9', name: 'Grade 9' },
    { id: 'grade-10', name: 'Grade 10' },
    { id: 'grade-11', name: 'Grade 11' },
    { id: 'grade-12', name: 'Grade 12' },
  ];

  const locations = [
    { id: 'loc-201a', name: 'Room 201A' },
    { id: 'loc-301b', name: 'Room 301B' },
    { id: 'loc-lab-chem', name: 'Chemistry Lab' },
  ];

  const teachers = [
    { id: 'tchr-1', firstName: 'John', lastName: 'Doe' },
    { id: 'tchr-2', firstName: 'Jane', lastName: 'Smith' },
    { id: 'tchr-3', firstName: 'Alan', lastName: 'Turing' },
  ];

  const subjects = [
    { id: 'subj-alg1', name: 'Algebra I', departmentId: 'dept-math' },
    { id: 'subj-geo', name: 'Geometry', departmentId: 'dept-math' },
    { id: 'subj-bio', name: 'Biology', departmentId: 'dept-sci' },
    { id: 'subj-chem', name: 'Chemistry', departmentId: 'dept-sci' },
    { id: 'subj-eng-lit', name: 'English Literature', departmentId: 'dept-eng' },
    { id: 'subj-us-hist', name: 'U.S. History', departmentId: 'dept-hist' },
  ];

  return { academicTerms, subjects, teachers, gradeLevels, locations, departments } satisfies Prerequisites;
}