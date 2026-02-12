import type { Shift } from '../db';

export function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number);
  return { hours: h, minutes: m };
}

export function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

export function durationInHours(startTime: string, endTime: string): number {
  let startMin = timeToMinutes(startTime);
  let endMin = timeToMinutes(endTime);
  if (endMin <= startMin) {
    endMin += 24 * 60; // overnight shift
  }
  return (endMin - startMin) / 60;
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const fmtTime = (t: string) => {
    const { hours, minutes } = parseTime(t);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return minutes === 0 ? `${h}${ampm}` : `${h}:${String(minutes).padStart(2, '0')}${ampm}`;
  };
  return `${fmtTime(startTime)} - ${fmtTime(endTime)}`;
}

export function abbreviatedTimeRange(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`;
}

export function calculatePay(shift: Pick<Shift, 'startTime' | 'endTime' | 'payRate' | 'payType'>): number {
  if (shift.payType === 'fixed') return shift.payRate;
  return shift.payRate * durationInHours(shift.startTime, shift.endTime);
}

export function hasOverlap(a: Pick<Shift, 'startTime' | 'endTime'>, b: Pick<Shift, 'startTime' | 'endTime'>): boolean {
  const aStart = timeToMinutes(a.startTime);
  let aEnd = timeToMinutes(a.endTime);
  if (aEnd <= aStart) aEnd += 24 * 60;

  const bStart = timeToMinutes(b.startTime);
  let bEnd = timeToMinutes(b.endTime);
  if (bEnd <= bStart) bEnd += 24 * 60;

  return aStart < bEnd && bStart < aEnd;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
