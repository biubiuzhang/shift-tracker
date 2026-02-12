import type { Shift, Job } from '../db';
import { formatTimeRange, formatDuration, durationInHours, calculatePay, formatCurrency } from '../utils/time';
import { JobBadge } from './JobBadge';

interface ShiftCardProps {
  shift: Shift;
  job: Job | undefined;
  onEdit: (shift: Shift) => void;
}

export function ShiftCard({ shift, job, onEdit }: ShiftCardProps) {
  const hours = durationInHours(shift.startTime, shift.endTime);
  const pay = calculatePay(shift);

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${job?.color ?? '#999'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
      }}
      onClick={() => onEdit(shift)}
    >
      <JobBadge name={job?.name ?? '?'} color={job?.color ?? '#999'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '22px' }}>
          {job?.name ?? '未知工作'}
        </div>
        <div style={{ color: 'var(--color-secondary-label)', fontSize: '19px', marginTop: '2px' }}>
          {formatTimeRange(shift.startTime, shift.endTime)}
          <span style={{ margin: '0 6px', opacity: 0.4 }}>|</span>
          {formatDuration(hours)}
        </div>
        <div style={{ color: 'var(--color-blue)', fontWeight: 600, fontSize: '19px', marginTop: '4px' }}>
          {formatCurrency(pay)}
          {shift.payType === 'hourly' && (
            <span style={{ fontWeight: 400, fontSize: '16px', color: 'var(--color-tertiary-label)' }}>
              {' '}({formatCurrency(shift.payRate)}/时)
            </span>
          )}
        </div>
        {shift.notes && (
          <div style={{
            color: 'var(--color-tertiary-label)',
            fontSize: '18px',
            marginTop: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {shift.notes}
          </div>
        )}
      </div>
      <button
        style={{
          color: 'var(--color-tertiary-label)',
          fontSize: '20px',
          padding: '4px',
          flexShrink: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(shift);
        }}
      >
        &#9998;
      </button>
    </div>
  );
}
