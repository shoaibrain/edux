
import { RRule, Weekday } from 'rrule';
import { RecurrenceRule } from '../../../types/events';

export class RecurrenceModel {
  /**
   * Generate all occurrences for a recurring event within a date range
   */
  static generateOccurrences(
    startDate: Date,
    endDate: Date,
    recurrenceRule: RecurrenceRule
  ): Date[] {
    const rruleOptions: any = {
      dtstart: startDate,
      until: recurrenceRule.endDate || endDate,
      count: recurrenceRule.occurrenceCount,
    };

    // Set frequency
    switch (recurrenceRule.frequency) {
      case 'DAILY':
        rruleOptions.freq = RRule.DAILY;
        break;
      case 'WEEKLY':
        rruleOptions.freq = RRule.WEEKLY;
        if (recurrenceRule.weekdays) {
          rruleOptions.byweekday = recurrenceRule.weekdays.map(day => 
            day === 0 ? 0 : 
            day === 1 ? 1 :
            day === 2 ? 2 :
            day === 3 ? 3 :
            day === 4 ? 4 :
            day === 5 ? 5 : 6
          );
        }
        break;
      case 'MONTHLY':
        rruleOptions.freq = RRule.MONTHLY;
        if (recurrenceRule.monthDay) {
          rruleOptions.bymonthday = recurrenceRule.monthDay;
        }
        if (recurrenceRule.monthWeek && recurrenceRule.monthWeekday !== undefined) {
          rruleOptions.bysetpos = recurrenceRule.monthWeek;
          rruleOptions.byweekday = recurrenceRule.monthWeekday;
        }
        break;
      case 'YEARLY':
        rruleOptions.freq = RRule.YEARLY;
        break;
    }

    // Set interval
    if (recurrenceRule.interval > 1) {
      rruleOptions.interval = recurrenceRule.interval;
    }

    const rule = new RRule(rruleOptions);
    let occurrences = rule.between(startDate, endDate);

    // Apply exceptions
    if (recurrenceRule.exceptions) {
      occurrences = occurrences.filter(date => 
        !recurrenceRule.exceptions!.some(exception => 
          this.isSameDay(date, exception)
        )
      );
    }

    return occurrences;
  }

  /**
   * Check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Validate recurrence rule
   */
  static validateRecurrenceRule(rule: RecurrenceRule): string[] {
    const errors: string[] = [];

    if (rule.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    if (rule.frequency === 'WEEKLY' && (!rule.weekdays || rule.weekdays.length === 0)) {
      errors.push('Weekly recurrence must specify weekdays');
    }

    if (rule.frequency === 'MONTHLY') {
      if (!rule.monthDay && (!rule.monthWeek || rule.monthWeekday === undefined)) {
        errors.push('Monthly recurrence must specify either monthDay or monthWeek + monthWeekday');
      }
    }

    if (rule.endDate && rule.occurrenceCount) {
      errors.push('Cannot specify both endDate and occurrenceCount');
    }

    return errors;
  }
}