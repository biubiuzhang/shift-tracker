import { format, eachDayOfInterval, getDay, parseISO } from 'date-fns';
import { db } from '../db';
import type { Shift } from '../db';

export async function materializePatterns(
  weekStart: Date,
  weekEnd: Date
): Promise<Shift[]> {
  const patterns = await db.recurringPatterns.toArray();
  const generated: Shift[] = [];
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  for (const pattern of patterns) {
    const effectiveFrom = parseISO(pattern.effectiveFrom);
    const effectiveTo = pattern.effectiveTo ? parseISO(pattern.effectiveTo) : null;

    for (const day of days) {
      const dayOfWeek = getDay(day); // 0=Sun ... 6=Sat
      if (!pattern.daysOfWeek.includes(dayOfWeek)) continue;

      // Check effective range
      if (day < effectiveFrom) continue;
      if (effectiveTo && day > effectiveTo) continue;

      const dateStr = format(day, 'yyyy-MM-dd');

      // Check if a manual shift already exists for this job+day+time
      const existing = await db.shifts
        .where('[jobId+date]')
        .equals([pattern.jobId, dateStr])
        .toArray();

      const alreadyExists = existing.some(
        (s) => s.startTime === pattern.startTime && s.endTime === pattern.endTime
      );

      if (!alreadyExists) {
        // Check if this pattern already generated a shift for this day
        const alreadyGenerated = existing.some(
          (s) => s.recurringPatternId === pattern.id
        );
        if (!alreadyGenerated) {
          const job = await db.jobs.get(pattern.jobId);
          if (job && !job.archived) {
            generated.push({
              jobId: pattern.jobId,
              date: dateStr,
              startTime: pattern.startTime,
              endTime: pattern.endTime,
              payRate: job.defaultPayRate,
              payType: job.payType,
              notes: '',
              recurringPatternId: pattern.id,
            });
          }
        }
      }
    }
  }

  return generated;
}

export async function saveGeneratedShifts(shifts: Shift[]): Promise<void> {
  if (shifts.length === 0) return;
  await db.shifts.bulkAdd(shifts);
}
