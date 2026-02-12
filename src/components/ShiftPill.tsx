import type { Shift, Job } from '../db';
import { abbreviatedTimeRange, durationInHours, formatDuration, formatCurrency, calculatePay } from '../utils/time';

interface ShiftPillProps {
  shift: Shift;
  job: Job | undefined;
  large?: boolean;
}

export function ShiftPill({ shift, job, large }: ShiftPillProps) {
  const color = job?.color ?? '#999';
  const name = job?.name ?? '未知';
  const timeStr = abbreviatedTimeRange(shift.startTime, shift.endTime);

  if (large) {
    const pay = formatCurrency(calculatePay(shift));
    const duration = formatDuration(durationInHours(shift.startTime, shift.endTime));
    return (
      <div
        style={{
          background: color + '20',
          borderLeft: `4px solid ${color}`,
          borderRadius: '6px',
          padding: '10px 12px',
          marginBottom: '8px',
          fontSize: '24px',
          lineHeight: '1.4',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          <span style={{ color: '#3C3C43', fontSize: '20px' }}>{timeStr}</span>
          <span style={{ fontWeight: 700, color }}>{name}</span>
        </div>
        <div style={{ color, fontSize: '20px', fontWeight: 600, marginTop: '2px' }}>
          {pay} · {duration}
        </div>
        {shift.notes && (
          <div style={{
            color: '#8E8E93',
            fontSize: '22px',
            marginTop: '3px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {shift.notes}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: color + '20',
        borderLeft: `2px solid ${color}`,
        borderRadius: '3px',
        padding: '1px 3px',
        marginBottom: '2px',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '3px',
        whiteSpace: 'nowrap',
        fontSize: '17px',
        lineHeight: '1.2',
      }}>
        <span style={{ color: '#3C3C43', fontSize: '11px', flexShrink: 0 }}>
          {timeStr}
        </span>
        <span style={{ fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
      </div>
      {shift.notes && (
        <div style={{
          color: '#8E8E93',
          fontSize: '12px',
          lineHeight: '1.2',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {shift.notes}
        </div>
      )}
    </div>
  );
}
