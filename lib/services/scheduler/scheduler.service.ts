import { v4 as uuidv4 } from 'uuid';
import {
  ScheduledEvent,
  EventInstance,
  EventAttendee,
  EventResource,
  RecurrenceRule,
  EventType,
  EventStatus,
  AttendeeRole,
  AttendanceStatus,
  ResourceType
} from '../../types/events';
import { RecurrenceModel } from './models/recurrence.model';
import log from '@/lib/logger';

export interface CreateEventOptions {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: EventType;
  timezone: string;
  maxAttendees?: number;
  requiresRegistration: boolean;
  metadata: Record<string, unknown>;
  createdBy: string;
  tenantId: string;
  recurrenceRule?: RecurrenceRule;
  attendees?: Array<{
    personId: string;
    role: AttendeeRole;
    status: AttendanceStatus;
  }>;
  resources?: Array<{
    resourceType: ResourceType;
    resourceId?: string;
    resourceName: string;
    quantity: number;
  }>;
}

export interface ScheduleConflict {
  type: 'TIME_OVERLAP' | 'RESOURCE_CONFLICT' | 'CONSTRAINT_VIOLATION' | 'ATTENDEE_CONFLICT' | 'DURATION_LIMIT';
  message: string;
  conflictingEventId?: string;
  severity: 'WARNING' | 'ERROR';
  details?: Record<string, unknown>;
}

// Fix the 'any' types by using proper interfaces
export class SchedulerService {
  private events: Map<string, ScheduledEvent> = new Map();
  private eventInstances: Map<string, EventInstance> = new Map();
  private eventAttendees: Map<string, EventAttendee> = new Map();
  private eventResources: Map<string, EventResource> = new Map();

  /**
   * Create a new event with advanced features
   */
  async createEvent(options: CreateEventOptions): Promise<ScheduledEvent> {
    const eventId = uuidv4();
    
    try {
      log.info(`Creating new event: ${options.title} (${options.eventType}) - ID: ${eventId}`);

      // Validate basic event data
      this.validateEventData(options);

      // Check for conflicts
      const conflicts = await this.checkConflicts(options);
      if (conflicts.some(c => c.severity === 'ERROR')) {
        log.warn('Event creation blocked due to conflicts' );
        throw new Error(`Cannot create event due to conflicts: ${conflicts.map(c => c.message).join(', ')}`);
      }

      // Log warnings if any
      const warnings = conflicts.filter(c => c.severity === 'WARNING');
      if (warnings.length > 0) {
        log.warn('Event created with warnings');
      }

      const event: ScheduledEvent = {
        id: eventId,
        title: options.title,
        description: options.description,
        startTime: options.startTime,
        endTime: options.endTime,
        eventType: options.eventType,
        timezone: options.timezone,
        isRecurring: !!options.recurrenceRule,
        status: 'scheduled',
        maxAttendees: options.maxAttendees,
        requiresRegistration: options.requiresRegistration,
        metadata: options.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: options.createdBy,
        tenantId: options.tenantId,
        recurrenceRule: options.recurrenceRule,
      };

      // Store the main event
      this.events.set(eventId, event);

      // Handle recurring events
      if (options.recurrenceRule) {
        await this.createRecurringInstances(event, options.recurrenceRule);
      }

      // Add attendees
      if (options.attendees) {
        await this.addEventAttendees(eventId, options.attendees);
      }

      // Add resources
      if (options.resources) {
        await this.addEventResources(eventId, options.resources);
      }

      log.info(`Event created successfully | ${JSON.stringify({ eventId, isRecurring: event.isRecurring })}`);
      return event;

    } catch (error) {
      log.error(`Failed to create event | ${JSON.stringify({ eventId, error: error instanceof Error ? error.message : 'Unknown error' })}`);
      throw error;
    }
  }

  /**
   * Create recurring event instances
   */
  private async createRecurringInstances(event: ScheduledEvent, recurrenceRule: RecurrenceRule): Promise<void> {
    try {
      log.info(`Creating recurring instances | ${JSON.stringify({ eventId: event.id, recurrenceRule: recurrenceRule.name })}`);

      const occurrences = RecurrenceModel.generateOccurrences(
        event.startTime,
        new Date(event.startTime.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year ahead
        recurrenceRule
      );

      // Create individual instances for each occurrence
      occurrences.forEach((occurrenceDate) => {
        const instanceId = uuidv4();
        
        // Preserve the exact time of day from the original event
        const startHours = event.startTime.getHours();
        const startMinutes = event.startTime.getMinutes();
        const startSeconds = event.startTime.getSeconds();
        const startMilliseconds = event.startTime.getMilliseconds();
        
        const endHours = event.endTime.getHours();
        const endMinutes = event.endTime.getMinutes();
        const endSeconds = event.endTime.getSeconds();
        const endMilliseconds = event.endTime.getMilliseconds();
        
        // Create new start and end times for this occurrence
        const newStartTime = new Date(occurrenceDate);
        newStartTime.setHours(startHours, startMinutes, startSeconds, startMilliseconds);
        
        const newEndTime = new Date(occurrenceDate);
        newEndTime.setHours(endHours, endMinutes, endSeconds, endMilliseconds);

        const instance = {
          id: instanceId,
          eventId: event.id,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'scheduled' as EventStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.eventInstances.set(instanceId, instance);
      });

      log.info(`Recurring instances created | ${JSON.stringify({ eventId: event.id, instanceCount: occurrences.length })}`);

    } catch (error) {
      log.error(`Failed to create recurring instances | ${JSON.stringify({ eventId: event.id, error: error instanceof Error ? error.message : 'Unknown error' })}`);
      throw error;
    }
  }

  /**
   * Add attendees to an event
   */
  private async addEventAttendees(eventId: string, attendees: Array<{ personId: string; role: AttendeeRole; status: AttendanceStatus }>): Promise<void> {
    try {
      attendees.forEach(attendee => {
        const attendeeId = uuidv4();
        const eventAttendee = {
          id: attendeeId,
          eventId,
          personId: attendee.personId,
          role: attendee.role,
          status: attendee.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.eventAttendees.set(attendeeId, eventAttendee);
      });

      log.info(`Event attendees added | ${JSON.stringify({ eventId, attendeeCount: attendees.length })}`);

    } catch (error) {
      log.error(`Failed to add event attendees | ${JSON.stringify({ eventId, error: error instanceof Error ? error.message : 'Unknown error' })}`);
      throw error;
    }
  }

  /**
   * Add resources to an event
   */
  private async addEventResources(eventId: string, resources: Array<{ resourceType: ResourceType; resourceId?: string; resourceName: string; quantity: number }>): Promise<void> {
    try {
      resources.forEach(resource => {
        const resourceId = uuidv4();
        const eventResource = {
          id: resourceId,
          eventId,
          resourceType: resource.resourceType,
          resourceId: resource.resourceId,
          resourceName: resource.resourceName,
          quantity: resource.quantity,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.eventResources.set(resourceId, eventResource);
      });

      log.info(`Event resources added | ${JSON.stringify({ eventId, resourceCount: resources.length })}`);

    } catch (error) {
      log.error(`Failed to add event resources | ${JSON.stringify({ eventId, error: error instanceof Error ? error.message : 'Unknown error' })}`);
      throw error;
    }
  }

  /**
   * Get events within a date range
   */
  async getEventsInRange(startDate: Date, endDate: Date, tenantId: string): Promise<ScheduledEvent[]> {
    return Array.from(this.events.values()).filter(event => 
      event.tenantId === tenantId &&
      event.startTime >= startDate &&
      event.endTime <= endDate
    );
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<ScheduledEvent | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * Update an event
   */
  async updateEvent(eventId: string, updates: Partial<ScheduledEvent>): Promise<ScheduledEvent> {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const updatedEvent: ScheduledEvent = {
      ...event,
      ...updates,
      updatedAt: new Date(),
    };

    this.events.set(eventId, updatedEvent);
    return updatedEvent;
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // If it's a recurring event, delete all instances
    if (event.isRecurring) {
      Array.from(this.eventInstances.values())
        .filter(e => e.eventId === eventId)
        .forEach(e => this.eventInstances.delete(e.id));
    }

    // Delete attendees
    Array.from(this.eventAttendees.values())
      .filter(e => e.eventId === eventId)
      .forEach(e => this.eventAttendees.delete(e.id));

    // Delete resources
    Array.from(this.eventResources.values())
      .filter(e => e.eventId === eventId)
      .forEach(e => this.eventResources.delete(e.id));

    this.events.delete(eventId);
  }

  /**
   * Enhanced conflict detection
   */
  private async checkConflicts(options: CreateEventOptions): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    try {
      // ✅ CRITICAL: Skip time overlap check for ALL academic events
      if (!this.isAcademicEvent(options.eventType)) {
        // Check time overlap with existing events (only for non-academic events)
        const overlappingEvents = Array.from(this.events.values()).filter(event => 
          event.tenantId === options.tenantId &&
          event.status === 'scheduled' &&
          this.hasTimeOverlap(
            options.startTime,
            options.endTime,
            event.startTime,
            event.endTime
          )
        );

        if (overlappingEvents.length > 0) {
          conflicts.push({
            type: 'TIME_OVERLAP',
            message: `Event overlaps with ${overlappingEvents.length} existing event(s)`,
            conflictingEventId: overlappingEvents[0].id,
            severity: 'ERROR',
            details: { overlappingEventIds: overlappingEvents.map(e => e.id) }
          });
        }
      }

      // Check resource conflicts
      if (options.resources) {
        const resourceConflicts = await this.checkResourceConflicts(options);
        conflicts.push(...resourceConflicts);
      }

      // Check attendee conflicts
      if (options.attendees) {
        const attendeeConflicts = await this.checkAttendeeConflicts(options);
        conflicts.push(...attendeeConflicts);
      }

      // ✅ CRITICAL: Skip business rules for academic events
      if (this.isAcademicEvent(options.eventType)) {
        return conflicts; // Return early - no business rule validation needed
      }

      // Check business hours constraint (only for regular events)
      const startHour = options.startTime.getHours();
      const endHour = options.endTime.getHours();
      if (startHour < 8 || endHour > 18) {
        conflicts.push({
          type: 'CONSTRAINT_VIOLATION',
          message: 'Events must be scheduled within business hours (8 AM - 6 PM)',
          severity: 'WARNING',
        });
      }

      // Check event duration constraint (only for regular events)
      const durationHours = (options.endTime.getTime() - options.startTime.getTime()) / (1000 * 60 * 60);
      if (durationHours > 8) {
        conflicts.push({
          type: 'DURATION_LIMIT', // ✅ Use the new type you added
          message: 'Event duration cannot exceed 8 hours',
          severity: 'ERROR',
        });
      }

    } catch (error) {
      log.error(`Error during conflict detection | ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}`);
      throw error;
    }

    return conflicts;
  }

  /**
   * Check resource conflicts
   */
  private async checkResourceConflicts(options: CreateEventOptions): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];
    
    // Basic resource conflict check
    if (options.resources) {
      // Check for room conflicts, equipment conflicts, etc.
      // Implementation placeholder
    }
    
    return conflicts;
  }

  /**
   * Check attendee conflicts
   */
  private async checkAttendeeConflicts(options: CreateEventOptions): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];
    
    // Basic attendee conflict check
    if (options.attendees) {
      // Check for schedule conflicts, availability, etc.
      // Implementation placeholder
    }
    
    return conflicts;
  }

  /**
   * Check if two time ranges overlap
   */
  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Validate event data
   */
  private validateEventData(options: CreateEventOptions): void {
    if (!options.title.trim()) {
      throw new Error('Event title is required');
    }

    if (options.startTime >= options.endTime) {
      throw new Error('Start time must be before end time');
    }

    if (options.recurrenceRule) {
      const errors = RecurrenceModel.validateRecurrenceRule(options.recurrenceRule);
      if (errors.length > 0) {
        throw new Error(`Invalid recurrence rule: ${errors.join(', ')}`);
      }
    }
  }

  /**
   * Validate business rules
   */
  private validateBusinessRules(options: CreateEventOptions): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // ✅ CRITICAL: Skip business hours validation for academic events
    if (options.eventType === 'ACADEMIC_YEAR' || 
        options.eventType === 'ACADEMIC_TERM' || 
        options.eventType === 'EXAM_PERIOD' || 
        options.eventType === 'BREAK_PERIOD') {
      return conflicts; // Return empty conflicts array - no validation needed
    }

    // ✅ Only apply duration limit to regular events
    const durationMs = options.endTime.getTime() - options.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours > 8) {
      conflicts.push({
        type: 'DURATION_LIMIT',
        message: 'Event duration cannot exceed 8 hours',
        severity: 'ERROR'
      });
    }

    // ... rest of existing validation logic ...
    
    return conflicts;
  }

  private isAcademicEvent(eventType: EventType): boolean {
    return ['ACADEMIC_YEAR', 'ACADEMIC_TERM', 'EXAM_PERIOD', 'BREAK_PERIOD'].includes(eventType);
  }

  private validateAcademicEventRules(options: CreateEventOptions): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Academic events can span any duration - no time limits
    // Only validate that start date is before end date
    if (options.startTime >= options.endTime) {
      conflicts.push({
        type: 'CONSTRAINT_VIOLATION',
        message: 'Start date must be before end date',
        severity: 'ERROR'
      });
    }
    
    return conflicts;
  }

  private validateRegularEventRules(options: CreateEventOptions): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Apply the 8-hour limit only to regular events
    const durationMs = options.endTime.getTime() - options.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours > 8) {
      conflicts.push({
        type: 'DURATION_LIMIT',
        message: 'Event duration cannot exceed 8 hours',
        severity: 'ERROR'
      });
    }

    // ... other regular event validations ...
    
    return conflicts;
  }

  /**
   * Convert event time to a specific timezone for display
   */
  static formatEventTime(event: ScheduledEvent, targetTimezone: string): string {
    try {
      const startTime = new Date(event.startTime).toLocaleString('en-US', {
        timeZone: targetTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const endTime = new Date(event.endTime).toLocaleString('en-US', {
        timeZone: targetTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return `${startTime} - ${endTime}`;
    } catch {
      // Remove unused error parameter
      return `${event.startTime.toISOString()} - ${event.endTime.toISOString()}`;
    }
  }

  // ✅ Add this helper method
  private isAcademicEventWithParent(options: CreateEventOptions): boolean {
    // Check if this is an academic term that has a parent academic year
    if (options.eventType === 'ACADEMIC_TERM') {
      // Look for parent academic year in metadata
      const parentAcademicYearId = options.metadata?.parentAcademicYearId;
      if (parentAcademicYearId) {
        // Check if parent exists and this term is within its time range
        const parentEvent = Array.from(this.events.values()).find(event => 
          event.id === parentAcademicYearId && 
          event.eventType === 'ACADEMIC_YEAR'
        );
        
        if (parentEvent) {
          // ✅ This term is contained within its parent academic year - no overlap conflict
          return true;
        }
      }
    }
    
    return false;
  }
}
