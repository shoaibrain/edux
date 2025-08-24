'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { TestTube, Play } from 'lucide-react';

import { SimpleSchedulerTestSchema, type SimpleSchedulerTestInput, type SimpleTestResult } from '@/lib/dto/scheduler-test';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SchedulerTestDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  schoolId: number;
}

// Mock test function for now
async function testSimpleSchedulerEvent(input: SimpleSchedulerTestInput): Promise<SimpleTestResult> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: `Successfully tested ${input.eventType}: "${input.title}"`,
    eventId: `test-${Date.now()}`,
    executionTime: 1000
  };
}

export function SchedulerTestDialog({ isOpen, setIsOpen, schoolId }: SchedulerTestDialogProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimpleTestResult | null>(null);

  const form = useForm<SimpleSchedulerTestInput>({
    resolver: zodResolver(SimpleSchedulerTestSchema),
    defaultValues: {
      title: 'Test Event',
      eventType: 'CLASS_PERIOD',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      isRecurring: false,
      simulateOnly: true,
    }
  });

  const onSubmit = async (values: SimpleSchedulerTestInput) => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const testResult = await testSimpleSchedulerEvent(values);
      setResult(testResult);
      
      if (testResult.success) {
        toast.success(testResult.message);
      } else {
        toast.error(testResult.message);
      }
    } catch (error) {
      toast.error('Test failed to run');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Simple Scheduler Test
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CLASS_PERIOD">Class Period</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                        <SelectItem value="SCHOOL_EVENT">School Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="simulateOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Simulate Only (dont create real events)</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className={result.success ? 'text-green-600' : 'text-red-600'}>
                  {result.success ? '✓ Test Passed' : '✗ Test Failed'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{result.message}</p>
                {result.eventId && (
                  <p className="text-sm text-muted-foreground">Event ID: {result.eventId}</p>
                )}
                {result.errors && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {result.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Execution time: {result.executionTime}ms
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
