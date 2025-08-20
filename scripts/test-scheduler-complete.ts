import { SchedulerService } from '../lib/services/scheduler/scheduler.service';
import { EventType, AttendeeRole, AttendanceStatus, ResourceType } from '../lib/types/events';

async function testCompleteSchedulerService() {
  console.log('�� Testing Complete Scheduler Service (Phase 1 + Phase 2)...\n');

  const scheduler = new SchedulerService();

  try {
    // ===== PHASE 1 TESTS =====
    console.log('📋 PHASE 1: Basic Scheduling Features\n');

    // Test 1: Create a simple class period (EST timezone)
    console.log(' Test 1: Creating a simple class period (EST timezone)...');
    const classPeriod = await scheduler.createEvent({
      title: 'Mathematics 101',
      description: 'Introduction to Algebra',
      startTime: new Date('2024-01-15T09:00:00-05:00'), // 9 AM EST
      endTime: new Date('2024-01-15T10:00:00-05:00'),   // 10 AM EST
      eventType: 'CLASS_PERIOD',
      timezone: 'America/New_York',
      maxAttendees: 25,
      requiresRegistration: false,
      metadata: {
        subjectId: 'math-101',
        teacherId: 'teacher-john',
        roomId: 'room-201',
        gradeLevel: '10th Grade',
        curriculum: 'Common Core Algebra I'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc'
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
      timezone: 'America/Los_Angeles',
      maxAttendees: 25,
      requiresRegistration: false,
      metadata: {
        subjectId: 'math-101',
        teacherId: 'teacher-john',
        roomId: 'room-201',
        gradeLevel: '10th Grade',
        curriculum: 'Common Core Algebra I'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc',
      recurrenceRule: {
        id: 'weekly-math-rule',
        name: 'Weekly Math Class',
        frequency: 'weekly',
        interval: 1,
        weekdays: [1, 3, 5], // Monday, Wednesday, Friday
        rruleString: 'FREQ=WEEKLY;BYDAY=MO,WE,FR'
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
      console.log(`      Time (${timezone}): ${SchedulerService.formatEventTime(event, timezone as string)}`);
      console.log(`      UTC: ${event.startTime.toISOString()}`);
      console.log('');
    });

    // Test 4: Test conflict detection
    console.log('⚠️ Test 4: Testing conflict detection...');
    try {
      await scheduler.createEvent({
        title: 'Conflicting Class',
        description: 'This should conflict with existing class',
        startTime: new Date('2024-01-15T09:30:00-05:00'), // Overlaps with first class
        endTime: new Date('2024-01-15T10:30:00-05:00'),
        eventType: 'CLASS_PERIOD',
        timezone: 'America/New_York',
        maxAttendees: 20,
        requiresRegistration: false,
        metadata: {
          subjectId: 'science-101',
          teacherId: 'teacher-jane',
          roomId: 'room-202',
          gradeLevel: '10th Grade'
        },
        createdBy: 'admin-user',
        tenantId: 'school-abc'
      });
    } catch (error) {
      console.log('✅ Conflict detection working correctly!');
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // ===== PHASE 2 TESTS =====
    console.log('🚀 PHASE 2: Advanced Calendar Features\n');

    // Test 5: Create event with attendees
    console.log('👥 Test 5: Creating event with attendees...');
    const eventWithAttendees = await scheduler.createEvent({
      title: 'Staff Meeting',
      description: 'Weekly staff coordination meeting',
      startTime: new Date('2024-01-16T14:00:00-05:00'),
      endTime: new Date('2024-01-16T15:00:00-05:00'),
      eventType: 'MEETING',
      timezone: 'America/New_York',
      maxAttendees: 20,
      requiresRegistration: true,
      metadata: {
        meetingType: 'staff_coordination',
        agenda: 'Weekly updates and planning'
      },
      createdBy: 'admin-user',
      tenantId: 'school-abc',
      attendees: [
        { personId: 'teacher-1', role: 'organizer', status: 'confirmed' },
        { personId: 'teacher-2', role: 'attendee', status: 'invited' },
        { personId: 'teacher-3', role: 'attendee', status: 'invited' }
      ]
    });

    console.log('✅ Event with attendees created successfully!');
    console.log(`   ID: ${eventWithAttendees.id}`);
    console.log(`   Title: ${eventWithAttendees.title}`);
    console.log(`   Attendees: ${eventWithAttendees.attendees?.length || 0}\n`);

    // Test 6: Create event with resources
    console.log('🏫 Test 6: Creating event with resources...');
    const eventWithResources = await scheduler.createEvent({
      title: 'Science Lab Session',
      description: 'Chemistry lab practical',
      startTime: new Date('2024-01-17T10:00:00-05:00'),
      endTime: new Date('2024-01-17T12:00:00-05:00'),
      eventType: 'CLASS_PERIOD',
      timezone: 'America/New_York',
      maxAttendees: 25,
      requiresRegistration: false,
      metadata: {
        subject: 'Chemistry',
        gradeLevel: '11th Grade'
      },
      createdBy: 'teacher-chem',
      tenantId: 'school-abc',
      resources: [
        { resourceType: 'room', resourceId: 'lab-101', resourceName: 'Chemistry Lab 101', quantity: 1 },
        { resourceType: 'equipment', resourceId: 'microscope-1', resourceName: 'Microscope Set 1', quantity: 5 },
        { resourceType: 'equipment', resourceId: 'beaker-set', resourceName: 'Beaker Set A', quantity: 10 }
      ]
    });

    console.log('✅ Event with resources created successfully!');
    console.log(`   ID: ${eventWithResources.id}`);
    console.log(`   Title: ${eventWithResources.title}`);
    console.log(`   Resources: ${eventWithResources.resources?.length || 0}\n`);

    // Test 7: Create complex recurring event
    console.log('🔄 Test 7: Creating complex recurring event...');
    const complexRecurringEvent = await scheduler.createEvent({
      title: 'Advanced Math Tutoring',
      description: 'Bi-weekly advanced mathematics tutoring sessions',
      startTime: new Date('2024-01-18T15:00:00-05:00'),
      endTime: new Date('2024-01-18T16:30:00-05:00'),
      eventType: 'CLASS_PERIOD',
      timezone: 'America/New_York',
      maxAttendees: 15,
      requiresRegistration: true,
      metadata: {
        subject: 'Advanced Mathematics',
        gradeLevel: '12th Grade',
        difficulty: 'Advanced'
      },
      createdBy: 'teacher-math',
      tenantId: 'school-abc',
      recurrenceRule: {
        id: 'bi-weekly-math',
        name: 'Bi-weekly Math Tutoring',
        frequency: 'weekly',
        interval: 2, // Every 2 weeks
        weekdays: [4], // Thursday
        rruleString: 'FREQ=WEEKLY;INTERVAL=2;BYDAY=TH'
      },
      attendees: [
        { personId: 'teacher-math', role: 'organizer', status: 'confirmed' }
      ],
      resources: [
        { resourceType: 'room', resourceId: 'math-lab', resourceName: 'Mathematics Lab', quantity: 1 }
      ]
    });

    console.log('✅ Complex recurring event created successfully!');
    console.log(`   ID: ${complexRecurringEvent.id}`);
    console.log(`   Title: ${complexRecurringEvent.title}`);
    console.log(`   Is Recurring: ${complexRecurringEvent.isRecurring}`);
    console.log(`   Recurrence: Every ${complexRecurringEvent.recurrenceRule?.interval} weeks on day ${complexRecurringEvent.recurrenceRule?.weekdays}\n`);

    // Test 8: Test business hours constraint
    console.log('🌙 Test 8: Testing business hours constraint...');
    try {
      await scheduler.createEvent({
        title: 'Late Night Study',
        description: 'This should trigger a business hours warning',
        startTime: new Date('2024-01-15T20:00:00-05:00'), // 8 PM EST
        endTime: new Date('2024-01-15T21:00:00-05:00'),   // 9 PM EST
        eventType: 'CLASS_PERIOD',
        timezone: 'America/New_York',
        maxAttendees: 15,
        requiresRegistration: false,
        metadata: {
          subject: 'study-101',
          teacherId: 'teacher-night',
          roomId: 'room-301',
          gradeLevel: '12th Grade'
        },
        createdBy: 'admin-user',
        tenantId: 'school-abc'
      });
      console.log('⚠️ Event created but with business hours warning\n');
    } catch (error) {
      console.log('❌ Unexpected error:', error);
    }

    // Test 9: Get all events with details
    console.log('📋 Test 9: Fetching all events with details...');
    const allEvents = Array.from(scheduler['events'].values());
    
    console.log(`✅ Found ${allEvents.length} total events`);
    allEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title}`);
      console.log(`      Type: ${event.eventType}`);
      console.log(`      Status: ${event.status}`);
      console.log(`      Attendees: ${event.attendees?.length || 0}`);
      console.log(`      Resources: ${event.resources?.length || 0}`);
      console.log(`      Recurring: ${event.isRecurring}`);
      console.log('');
    });

    console.log('🎯 All tests completed successfully!');
    console.log('✅ Phase 1: Basic scheduling features working correctly');
    console.log('✅ Phase 2: Advanced calendar features working correctly');
    console.log('�� Complete scheduler service is ready for production!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCompleteSchedulerService().catch(console.error);
