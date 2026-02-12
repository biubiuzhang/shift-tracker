import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { RecurringPattern } from '../db';

export function useRecurring() {
  const patterns = useLiveQuery(() => db.recurringPatterns.toArray()) ?? [];

  async function addPattern(pattern: Omit<RecurringPattern, 'id'>) {
    return db.recurringPatterns.add(pattern);
  }

  async function updatePattern(id: number, changes: Partial<RecurringPattern>) {
    return db.recurringPatterns.update(id, changes);
  }

  async function deletePattern(id: number) {
    // Also remove generated shifts for this pattern that are in the future
    const today = new Date().toISOString().split('T')[0];
    const generatedShifts = await db.shifts
      .where('recurringPatternId')
      .equals(id)
      .toArray();
    const futureIds = generatedShifts
      .filter((s) => s.date >= today)
      .map((s) => s.id!)
      .filter(Boolean);
    await db.shifts.bulkDelete(futureIds);
    return db.recurringPatterns.delete(id);
  }

  return { patterns, addPattern, updatePattern, deletePattern };
}
