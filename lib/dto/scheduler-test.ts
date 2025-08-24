import { z } from 'zod';

// Simple scheduler test schema
export const SimpleSchedulerTestSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  eventType: z.enum(['CLASS_PERIOD', 'MEETING', 'EXAM', 'SCHOOL_EVENT']),
  startTime: z.date(),
  endTime: z.date(),
  isRecurring: z.boolean(),
  simulateOnly: z.boolean(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type SimpleSchedulerTestInput = z.infer<typeof SimpleSchedulerTestSchema>;

export interface SimpleTestResult {
  success: boolean;
  message: string;
  eventId?: string;
  errors?: string[];
  executionTime: number;
}
