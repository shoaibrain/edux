import { v4 as uuidv4 } from 'uuid';
import { BaseEvent, ScheduledEvent, RecurrenceRule, EventType } from '../../types/events';
import { RecurrenceModel } from './models/recurrence.model';

export interface CreateEventOptions {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: EventType;
  metadata: Record<string, any>;
  createdBy: string;
  tenantId: string;
  recurrenceRule?: RecurrenceRule;
  timezone?: string; // ISO timezone string (e.g., 'America/New_York')
}

export interface ScheduleConflict {
  type: 'TIME_OVERLAP' | 'RESOURCE_CONFLICT' | 'CONSTRAINT_VIOLATION';
  message: string;
  conflictingEventId?: string;
  severity: 'WARNING' | 'ERROR';
}

export class SchedulerService {
  private events: Map<string, ScheduledEvent> = new Map();

  /**
   * Create a new event (one-time or recurring)
   */
  async createEvent(options: CreateEventOptions): Promise<ScheduledEvent> {
    // Validate basic event data
    this.validateEventData(options);

    // Check for conflicts
    const conflicts = await this.checkConflicts(options);
    if (conflicts.some(c => c.severity === 'ERROR')) {
      throw new Error(`Cannot create event due to conflicts: ${conflicts.map(c => c.message).join(', ')}`);
    }

    const event: ScheduledEvent = {
      id: uuidv4(),
      title: options.title,
      description: options.description,
      startTime: options.startTime,
      endTime: options.endTime,
      eventType: options.eventType,
      metadata: {
        ...options.metadata,
        timezone: options.timezone || 'UTC'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: options.createdBy,
      tenantId: options.tenantId,
      recurrenceRule: options.recurrenceRule,
      isRecurring: !!options.recurrenceRule,
      status: 'SCHEDULED',
    };

    // If recurring, generate all instances
    if (options.recurrenceRule) {
      const occurrences = RecurrenceModel.generateOccurrences(
        options.startTime,
        new Date(options.startTime.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year ahead
        options.recurrenceRule
      );

      // Store the parent event
      this.events.set(event.id, event);

      // Create individual instances for each occurrence
      occurrences.forEach((occurrenceDate, index) => {
        // Preserve the exact time of day from the original event
        const originalStartTime = options.startTime;
        const originalEndTime = options.endTime;
        
        // Get the time components (hours, minutes, seconds, milliseconds)
        const startHours = originalStartTime.getHours();
        const startMinutes = originalStartTime.getMinutes();
        const startSeconds = originalStartTime.getSeconds();
        const startMilliseconds = originalStartTime.getMilliseconds();
        
        const endHours = originalEndTime.getHours();
        const endMinutes = originalEndTime.getMinutes();
        const endSeconds = originalEndTime.getSeconds();
        const endMilliseconds = originalEndTime.getMilliseconds();
        
        // Create new start and end times for this occurrence
        const newStartTime = new Date(occurrenceDate);
        newStartTime.setHours(startHours, startMinutes, startSeconds, startMilliseconds);
        
        const newEndTime = new Date(occurrenceDate);
        newEndTime.setHours(endHours, endMinutes, endSeconds, endMilliseconds);

        const instance: ScheduledEvent = {
          ...event,
          id: uuidv4(),
          startTime: newStartTime,
          endTime: newEndTime,
          parentEventId: event.id,
          isRecurring: false,
        };
        this.events.set(instance.id, instance);
      });
    } else {
      this.events.set(event.id, event);
    }

    return event;
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
      Array.from(this.events.values())
        .filter(e => e.parentEventId === eventId)
        .forEach(e => this.events.delete(e.id));
    }

    this.events.delete(eventId);
  }

  /**
   * Check for scheduling conflicts
   */
  private async checkConflicts(options: CreateEventOptions): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];

    // Check time overlap with existing events
    const overlappingEvents = Array.from(this.events.values()).filter(event => 
      event.tenantId === options.tenantId &&
      event.status === 'SCHEDULED' &&
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
      });
    }

    // Check business hours (8 AM - 6 PM) in the event's timezone
    const startHour = options.startTime.getHours();
    const endHour = options.endTime.getHours();
    if (startHour < 8 || endHour > 18) {
      conflicts.push({
        type: 'CONSTRAINT_VIOLATION',
        message: 'Events must be scheduled within business hours (8 AM - 6 PM)',
        severity: 'WARNING',
      });
    }

    // Check event duration (max 8 hours)
    const durationHours = (options.endTime.getTime() - options.startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours > 8) {
      conflicts.push({
        type: 'CONSTRAINT_VIOLATION',
        message: 'Event duration cannot exceed 8 hours',
        severity: 'ERROR',
      });
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
    } catch (error) {
      // Fallback to UTC if timezone is invalid
      return `${event.startTime.toISOString()} - ${event.endTime.toISOString()}`;
    }
  }
}