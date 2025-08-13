'use client';

import React from 'react';
// Import the necessary types from FullCalendar
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Hardcoded data for initial testing and validation
const hardcodedEvents = [
  {
    title: 'First Term Begins',
    start: '2025-09-01',
    end: '2025-09-02',
    allDay: true,
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  {
    title: 'Mid-term Exams',
    start: '2025-10-20',
    end: '2025-10-25',
    allDay: true,
    backgroundColor: '#dc2626',
    borderColor: '#dc2626'
  },
  {
    title: 'Parent-Teacher Conference',
    start: '2025-11-15T16:00:00',
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
];

export default function SchoolCalendarPage() {
  // Correctly type the event handler's argument
  const handleEventClick = (clickInfo: EventClickArg) => {
    alert(`Event clicked: ${clickInfo.event.title}`);
  };

  // Correctly type the date selection handler's argument
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>School Calendar</CardTitle>
          <CardDescription>
            Manage academic schedules, holidays, and school-wide events.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Event
        </Button>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={hardcodedEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
        />
      </CardContent>
    </Card>
  );
}
