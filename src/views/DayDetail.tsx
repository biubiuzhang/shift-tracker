import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { useShiftsForDate } from '../hooks/useShifts';
import { useJobs } from '../hooks/useJobs';
import { ShiftCard } from '../components/ShiftCard';
import { ShiftForm } from '../components/ShiftForm';
import { ConflictBanner } from '../components/ConflictBanner';
import { detectConflicts } from '../utils/analytics';
import { durationInHours, calculatePay, formatDuration, formatCurrency } from '../utils/time';
import { db } from '../db';
import type { Shift } from '../db';

interface DayDetailProps {
  date: string;
  onBack: () => void;
}

export function DayDetail({ date, onBack }: DayDetailProps) {
  const shifts = useShiftsForDate(date);
  const { allJobs } = useJobs(true);
  const jobMap = new Map(allJobs.map((j) => [j.id!, j]));

  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  const conflicts = detectConflicts(shifts);
  const totalHours = shifts.reduce((sum, s) => sum + durationInHours(s.startTime, s.endTime), 0);
  const totalPay = shifts.reduce((sum, s) => sum + calculatePay(s), 0);

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingShift(null);
    setShowForm(true);
  };

  const addShift = async (shift: Omit<Shift, 'id'>) => {
    await db.shifts.add(shift);
  };

  const updateShift = async (id: number, changes: Partial<Shift>) => {
    await db.shifts.update(id, changes);
  };

  const deleteShift = async (id: number) => {
    await db.shifts.delete(id);
  };

  const dateObj = parseISO(date);

  return (
    <div className="view">
      <div className="view-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          排班表
        </button>
        <h1 style={{ fontSize: '26px' }}>{format(dateObj, 'yyyy年M月d日 EEEE', { locale: zhCN })}</h1>
      </div>

      <div className="scroll-content">
        <ConflictBanner count={conflicts.length} />

        {shifts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128197;</div>
            <div className="empty-state-title">暂无班次</div>
            <div className="empty-state-text">
              当天没有排班
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ marginTop: '16px', width: 'auto' }}
            >
              添加班次
            </button>
          </div>
        ) : (
          <>
            {shifts
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  job={jobMap.get(shift.jobId)}
                  onEdit={handleEdit}
                />
              ))}

            {/* Day totals */}
            <div className="card" style={{ marginTop: '8px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '17px', color: 'var(--color-secondary-label)', textTransform: 'uppercase', fontWeight: 600 }}>
                    当日合计
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
                    {formatDuration(totalHours)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '17px', color: 'var(--color-secondary-label)', textTransform: 'uppercase', fontWeight: 600 }}>
                    收入
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-blue)', marginTop: '4px' }}>
                    {formatCurrency(totalPay)}
                  </div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ margin: '16px' }}
            >
              添加班次
            </button>
          </>
        )}
      </div>

      <ShiftForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingShift(null); }}
        onSave={addShift}
        onUpdate={updateShift}
        onDelete={deleteShift}
        jobs={allJobs}
        editingShift={editingShift}
        defaultDate={date}
      />
    </div>
  );
}
