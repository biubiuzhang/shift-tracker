import type { Shift, Job } from '../db';
import { durationInHours, calculatePay, hasOverlap } from './time';

export interface ShiftConflict {
  date: string;
  shiftA: Shift;
  shiftB: Shift;
}

export interface JobSummary {
  job: Job;
  hours: number;
  earnings: number;
  shiftCount: number;
}

export interface PeriodSummary {
  totalHours: number;
  totalEarnings: number;
  jobSummaries: JobSummary[];
  conflicts: ShiftConflict[];
}

export function computeSummary(shifts: Shift[], jobs: Job[]): PeriodSummary {
  const jobMap = new Map(jobs.map((j) => [j.id!, j]));
  const summaryMap = new Map<number, JobSummary>();

  let totalHours = 0;
  let totalEarnings = 0;

  for (const shift of shifts) {
    const hours = durationInHours(shift.startTime, shift.endTime);
    const pay = calculatePay(shift);
    totalHours += hours;
    totalEarnings += pay;

    const existing = summaryMap.get(shift.jobId);
    if (existing) {
      existing.hours += hours;
      existing.earnings += pay;
      existing.shiftCount += 1;
    } else {
      const job = jobMap.get(shift.jobId);
      if (job) {
        summaryMap.set(shift.jobId, {
          job,
          hours,
          earnings: pay,
          shiftCount: 1,
        });
      }
    }
  }

  const conflicts = detectConflicts(shifts);

  return {
    totalHours,
    totalEarnings,
    jobSummaries: Array.from(summaryMap.values()).sort((a, b) => b.hours - a.hours),
    conflicts,
  };
}

export function detectConflicts(shifts: Shift[]): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];
  const byDate = new Map<string, Shift[]>();

  for (const shift of shifts) {
    const arr = byDate.get(shift.date) || [];
    arr.push(shift);
    byDate.set(shift.date, arr);
  }

  for (const [date, dayShifts] of byDate) {
    for (let i = 0; i < dayShifts.length; i++) {
      for (let j = i + 1; j < dayShifts.length; j++) {
        if (hasOverlap(dayShifts[i], dayShifts[j])) {
          conflicts.push({
            date,
            shiftA: dayShifts[i],
            shiftB: dayShifts[j],
          });
        }
      }
    }
  }

  return conflicts;
}
