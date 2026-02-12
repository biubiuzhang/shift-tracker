import { useLiveQuery } from 'dexie-react-hooks';
import { format, eachDayOfInterval } from 'date-fns';
import { db } from '../db';
import type { Shift } from '../db';

export function useShifts(startDate: Date, endDate: Date) {
  const dates = eachDayOfInterval({ start: startDate, end: endDate }).map((d) =>
    format(d, 'yyyy-MM-dd')
  );

  const shifts = useLiveQuery(
    async () => {
      const results: Shift[] = [];
      for (const date of dates) {
        const dayShifts = await db.shifts.where('date').equals(date).toArray();
        results.push(...dayShifts);
      }
      return results;
    },
    [dates.join(',')]
  ) ?? [];

  async function addShift(shift: Omit<Shift, 'id'>) {
    return db.shifts.add(shift);
  }

  async function updateShift(id: number, changes: Partial<Shift>) {
    return db.shifts.update(id, changes);
  }

  async function deleteShift(id: number) {
    return db.shifts.delete(id);
  }

  return { shifts, addShift, updateShift, deleteShift };
}

export function useShiftsForDate(date: string) {
  const shifts = useLiveQuery(
    () => db.shifts.where('date').equals(date).toArray(),
    [date]
  ) ?? [];

  return shifts;
}
