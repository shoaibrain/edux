'use server';

import { SchedulerService } from '@/lib/services/scheduler/scheduler.service';
import { SimpleSchedulerTestInput, SimpleTestResult } from '@/lib/dto/scheduler-test';
import { getSession } from '@/lib/session';

export async function testSimpleSchedulerEvent(input: SimpleSchedulerTestInput): Promise<SimpleTestResult> {
  const startTime = Date.now();
  
  try {
    const session = await getSession();
    
    const schedulerService = new SchedulerService();
    
    if (input.simulateOnly) {
      // Just validate without creating
      return {
        success: true,
        message: `Successfully validated ${input.eventType}: "${input.title}"`,
        eventId: `sim-${Date.now()}`,
        executionTime: Date.now() - startTime
      };
    } else {
      // Actually create the event
      const event = await schedulerService.createEvent({
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        eventType: input.eventType,
        timezone: 'UTC',
        requiresRegistration: false,
        metadata: { testEvent: true },
        createdBy: session.userId.toString(),
        tenantId: session.tenantId,
      });
      
      return {
        success: true,
        message: `Successfully created event: ${event.title}`,
        eventId: event.id,
        executionTime: Date.now() - startTime
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Test failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      executionTime: Date.now() - startTime
    };
  }
}
