import Dexie, { type Table } from 'dexie';

export interface Job {
  id?: number;
  name: string;
  color: string;
  defaultPayRate: number;
  payType: 'hourly' | 'fixed';
  archived: boolean;
}

export interface Shift {
  id?: number;
  jobId: number;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  payRate: number;
  payType: 'hourly' | 'fixed';
  notes: string;
  recurringPatternId?: number;
}

export interface RecurringPattern {
  id?: number;
  jobId: number;
  daysOfWeek: number[];   // 0=Sun, 1=Mon, ... 6=Sat
  startTime: string;
  endTime: string;
  effectiveFrom: string;  // "YYYY-MM-DD"
  effectiveTo?: string;
}

class ShiftTrackerDB extends Dexie {
  jobs!: Table<Job>;
  shifts!: Table<Shift>;
  recurringPatterns!: Table<RecurringPattern>;

  constructor() {
    super('ShiftTrackerDB');
    this.version(1).stores({
      jobs: '++id, name, archived',
      shifts: '++id, date, [jobId+date], jobId, recurringPatternId',
      recurringPatterns: '++id, jobId',
    });
  }
}

export const db = new ShiftTrackerDB();
