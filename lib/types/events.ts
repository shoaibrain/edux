export type EventType = 
  | 'CLASS_PERIOD' 
  | 'SCHOOL_EVENT' 
  | 'MEETING' 
  | 'EXAM' 
  | 'HOLIDAY'
  | 'ACADEMIC_YEAR'
  | 'ACADEMIC_TERM'
  | 'EXAM_PERIOD'
  | 'BREAK_PERIOD';
export type EventStatus = 'scheduled' | 'cancelled' | 'completed' | 'postponed';
export type AttendeeRole = 'organizer' | 'attendee' | 'optional' | 'required';
export type AttendanceStatus = 'invited' | 'confirmed' | 'declined' | 'tentative';
export type ResourceType = 'room' | 'equipment' | 'vehicle' | 'other';

export interface BaseEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: EventType;
  timezone: string;
  isRecurring: boolean;
  status: EventStatus;
  maxAttendees?: number;
  requiresRegistration: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tenantId: string;
}

export interface RecurrenceRule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  weekdays?: number[];
  monthDay?: number;
  monthWeek?: number;
  monthWeekday?: number;
  endDate?: Date;
  occurrenceCount?: number;
  exceptions?: Date[];
  rruleString: string;
}

export interface ScheduledEvent extends BaseEvent {
  recurrenceRule?: RecurrenceRule;
  parentEventId?: string;
  instances?: EventInstance[];
  attendees?: EventAttendee[];
  resources?: EventResource[];
}

export interface EventInstance {
  id: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  notes?: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  personId: string;
  role: AttendeeRole;
  status: AttendanceStatus;
  registeredAt?: Date;
  notes?: string;
}

export interface EventResource {
  id: string;
  eventId: string;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName: string;
  quantity: number;
  notes?: string;
}

// Add proper interfaces for academic events
export interface AcademicYearEvent extends BaseEvent {
  eventType: 'ACADEMIC_YEAR';
  metadata: {
    academicYearId: string;
    yearName: string;
    isCurrent: boolean;
    type: 'ACADEMIC_YEAR';
  };
}

export interface AcademicTermEvent extends BaseEvent {
  eventType: 'ACADEMIC_TERM';
  metadata: {
    termId: string;
    termName: string;
    academicYearId: string;
    gradeLevels: string[];
    type: 'ACADEMIC_TERM';
  };
}