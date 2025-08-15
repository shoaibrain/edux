'use client';

import React, { useState, useEffect } from 'react';
import { RRule, RRuleSet, rrulestr, Weekday } from 'rrule';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecurrenceRuleBuilderProps {
  onChange: (rruleString: string) => void;
  startDate?: Date; // optional; defaults to today
  initialValue?: string | null;
}

export function RecurrenceRuleBuilder({ onChange, startDate, initialValue }: RecurrenceRuleBuilderProps) {
  const [freq, setFreq] = useState<RRule.Frequency>(RRule.WEEKLY);
  const [interval, setInterval] = useState(1);
  const [byweekday, setByweekday] = useState<number[]>([]);
  const [until, setUntil] = useState<Date | undefined>();

  useEffect(() => {
    if (initialValue) {
      try {
        const ruleInput = rrulestr(initialValue);
        const rule = ruleInput instanceof RRuleSet ? ruleInput.rrules()[0] : ruleInput;

        if (rule) {
          setFreq(rule.options.freq);
          setInterval(rule.options.interval || 1);
          const weekdays = (rule.options.byweekday as (number[] | number | Weekday[] | Weekday)) || [];
          if (Array.isArray(weekdays)) {
            setByweekday(weekdays.map(d => typeof d === 'number' ? d : d.weekday));
          } else if (typeof weekdays === 'number') {
            setByweekday([weekdays]);
          } else if (weekdays instanceof Weekday) {
            setByweekday([weekdays.weekday]);
          }
          setUntil(rule.options.until || undefined);
        }
      } catch (e) {
        console.error('Error parsing initial RRULE string', e);
      }
    }
  }, [initialValue]);

  useEffect(() => {
    const dtStart = startDate ?? new Date();

    try {
      const options: RRule.Options = {
        freq,
        interval,
        dtstart: dtStart,
        wkst: RRule.SU,
      };

      if (freq === RRule.WEEKLY && byweekday.length > 0) {
        options.byweekday = byweekday;
      }
      if (until) {
        const untilDate = new Date(until);
        untilDate.setHours(23, 59, 59, 999);
        options.until = untilDate;
      }

      const rule = new RRule(options);
      onChange(rule.toString());
    } catch (e) {
      console.error('Error generating RRULE string', e);
    }
  }, [freq, interval, byweekday, until, startDate, onChange]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="space-y-1">
          <Label>Repeats</Label>
          <Select onValueChange={(v) => setFreq(Number(v))} value={String(freq)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={String(RRule.DAILY)}>Daily</SelectItem>
              <SelectItem value={String(RRule.WEEKLY)}>Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Repeat every</Label>
          <Input type="number" value={interval} onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))} min={1} />
        </div>
        <div className="space-y-1">
          <Label>Ends on (optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !until && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {until ? format(until, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={until} onSelect={setUntil} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {freq === RRule.WEEKLY && (
        <div className="space-y-2">
          <Label>On days</Label>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            value={byweekday.map(String)}
            onValueChange={(value) => setByweekday(value.map(Number).sort())}
            className="flex flex-wrap justify-start gap-1"
          >
            <ToggleGroupItem value={String(RRule.MO.weekday)}>Mon</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.TU.weekday)}>Tue</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.WE.weekday)}>Wed</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.TH.weekday)}>Thu</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.FR.weekday)}>Fri</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.SA.weekday)}>Sat</ToggleGroupItem>
            <ToggleGroupItem value={String(RRule.SU.weekday)}>Sun</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
}