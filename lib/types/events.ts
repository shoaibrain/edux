export type EventType = 'CLASS_PERIOD' | 'SCHOOL_EVENT' | 'MEETING' | 'EXAM' | 'HOLIDAY';

export interface BaseEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: EventType;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tenantId: string;
}

export interface ClassPeriodEvent extends BaseEvent {
  eventType: 'CLASS_PERIOD';
  metadata: {
    subjectId: string;
    teacherId: string;
    roomId: string;
    gradeLevel: string;
    maxStudents: number;
    curriculum?: string;
  };
}

export interface SchoolEvent extends BaseEvent {
  eventType: 'SCHOOL_EVENT';
  metadata: {
    eventCategory: 'ACADEMIC' | 'SOCIAL' | 'ADMINISTRATIVE' | 'SPORTS';
    targetAudience: string[];
    requiresRegistration: boolean;
    maxParticipants?: number;
    location?: string;
  };
}

export interface RecurrenceRule {
  id: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // every X days/weeks/months/years
  weekdays?: number[]; // 0-6 (Sunday-Saturday)
  monthDay?: number; // 1-31
  monthWeek?: number; // 1-5 (first week, second week, etc.)
  monthWeekday?: number; // 0-6 (Sunday-Saturday)
  endDate?: Date;
  occurrenceCount?: number;
  exceptions?: Date[]; // dates to exclude
}

export interface ScheduledEvent extends BaseEvent {
  recurrenceRule?: RecurrenceRule;
  isRecurring: boolean;
  parentEventId?: string; // for recurring event instances
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'POSTPONED';
}