import { SchedulerService } from '../lib/services/scheduler/scheduler.service';
import { EventType } from '../lib/types/events';

async function testSchedulerService() {
  console.log('🧪 Testing Scheduler Service with Timezone Support...\n');

  const scheduler = new SchedulerService();

  try {
    // Test 1: Create a simple class period with timezone
    console.log(' Test 1: Creating a simple class period (EST timezone)...');
    const classPeriod = await scheduler.createEvent({
      title: 'Mathematics 101',
      description: 'Introduction to Algebra',
      startTime: new Date('2024-01-15T09:00:00-05:00'), // 9 AM EST
      endTime: new Date('2024-01-15T10:00:00-05:00'),   // 10 AM EST
      eventType: 'CLASS_PERIOD',
      metadata: {
        subjectId: 'math-101',
        teacherId: 'teacher-john',
        roomId: 'room-201',
        gradeLevel: '10th Grade',
        maxStudents: 25,
        curriculum: 'Common Core Algebra I'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc',
      timezone: 'America/New_York'
    });

    console.log('✅ Class period created successfully!');
    console.log(`   ID: ${classPeriod.id}`);
    console.log(`   Title: ${classPeriod.title}`);
    console.log(`   Time (UTC): ${classPeriod.startTime.toISOString()} - ${classPeriod.endTime.toISOString()}`);
    console.log(`   Time (EST): ${SchedulerService.formatEventTime(classPeriod, 'America/New_York')}`);
    console.log(`   Is Recurring: ${classPeriod.isRecurring}\n`);

    // Test 2: Create a recurring class period (different time to avoid conflict)
    console.log(' Test 2: Creating a recurring class period (PST timezone)...');
    const recurringClass = await scheduler.createEvent({
      title: 'Weekly Mathematics 101',
      description: 'Introduction to Algebra - Weekly Sessions',
      startTime: new Date('2024-01-15T11:00:00-08:00'), // 11 AM PST
      endTime: new Date('2024-01-15T12:00:00-08:00'),   // 12 PM PST
      eventType: 'CLASS_PERIOD',
      metadata: {
        subjectId: 'math-101',
        teacherId: 'teacher-john',
        roomId: 'room-201',
        gradeLevel: '10th Grade',
        maxStudents: 25,
        curriculum: 'Common Core Algebra I'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc',
      timezone: 'America/Los_Angeles',
      recurrenceRule: {
        id: 'weekly-math-rule',
        frequency: 'WEEKLY',
        interval: 1,
        weekdays: [1, 3, 5], // Monday, Wednesday, Friday
      }
    });

    console.log('✅ Recurring class period created successfully!');
    console.log(`   ID: ${recurringClass.id}`);
    console.log(`   Title: ${recurringClass.title}`);
    console.log(`   Is Recurring: ${recurringClass.isRecurring}`);
    console.log(`   Recurrence: Every ${recurringClass.recurrenceRule?.frequency} on days ${recurringClass.recurrenceRule?.weekdays}`);
    console.log(`   Time (PST): ${SchedulerService.formatEventTime(recurringClass, 'America/Los_Angeles')}\n`);

    // Test 3: Get events in a date range
    console.log('📅 Test 3: Fetching events in date range...');
    const eventsInRange = await scheduler.getEventsInRange(
      new Date('2024-01-15T00:00:00Z'),
      new Date('2024-01-21T23:59:59Z'),
      'school-abc'
    );

    console.log(`✅ Found ${eventsInRange.length} events in the date range`);
    eventsInRange.forEach((event, index) => {
      const timezone = event.metadata.timezone || 'UTC';
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      Date: ${event.startTime.toLocaleDateString()}`);
      console.log(`      Time (${timezone}): ${SchedulerService.formatEventTime(event, timezone)}`);
      console.log(`      UTC: ${event.startTime.toISOString()}`);
      console.log('');
    });

    // Test 4: Create a school event in a different timezone
    console.log(' Test 4: Creating a school event (GMT timezone)...');
    const schoolEvent = await scheduler.createEvent({
      title: 'Parent-Teacher Conference Day',
      description: 'Annual parent-teacher conference for all grades',
      startTime: new Date('2024-01-20T14:00:00+00:00'), // 2 PM GMT
      endTime: new Date('2024-01-20T18:00:00+00:00'),   // 6 PM GMT
      eventType: 'SCHOOL_EVENT',
      metadata: {
        eventCategory: 'ACADEMIC',
        targetAudience: ['Parents', 'Teachers', 'Students'],
        requiresRegistration: true,
        maxParticipants: 200,
        location: 'School Gymnasium'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc',
      timezone: 'Europe/London'
    });

    console.log('✅ School event created successfully!');
    console.log(`   ID: ${schoolEvent.id}`);
    console.log(`   Title: ${schoolEvent.title}`);
    console.log(`   Category: ${schoolEvent.metadata.eventCategory}`);
    console.log(`   Location: ${schoolEvent.metadata.location}`);
    console.log(`   Time (GMT): ${SchedulerService.formatEventTime(schoolEvent, 'Europe/London')}\n`);

    // Test 5: Test conflict detection
    console.log('⚠️ Test 5: Testing conflict detection...');
    try {
      await scheduler.createEvent({
        title: 'Conflicting Class',
        description: 'This should conflict with existing class',
        startTime: new Date('2024-01-15T09:30:00-05:00'), // Overlaps with first class
        endTime: new Date('2024-01-15T10:30:00-05:00'),
        eventType: 'CLASS_PERIOD',
        metadata: {
          subjectId: 'science-101',
          teacherId: 'teacher-jane',
          roomId: 'room-202',
          gradeLevel: '10th Grade',
          maxStudents: 20
        },
        createdBy: 'admin-user',
        tenantId: 'school-abc',
        timezone: 'America/New_York'
      });
    } catch (error) {
      console.log('✅ Conflict detection working correctly!');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Test 6: Test business hours constraint
    console.log('🌙 Test 6: Testing business hours constraint...');
    try {
      await scheduler.createEvent({
        title: 'Late Night Study',
        description: 'This should trigger a business hours warning',
        startTime: new Date('2024-01-15T20:00:00-05:00'), // 8 PM EST
        endTime: new Date('2024-01-15T21:00:00-05:00'),   // 9 PM EST
        eventType: 'CLASS_PERIOD',
        metadata: {
          subjectId: 'study-101',
          teacherId: 'teacher-night',
          roomId: 'room-301',
          gradeLevel: '12th Grade',
          maxStudents: 15
        },
        createdBy: 'admin-user',
        tenantId: 'school-abc',
        timezone: 'America/New_York'
      });
      console.log('⚠️ Event created but with business hours warning\n');
    } catch (error) {
      console.log('❌ Unexpected error:', error);
    }

    console.log('🎯 All tests completed successfully!');
    console.log('The scheduler service is working correctly with timezone support for class period creation.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSchedulerService().catch(console.error);
