import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isToday } from 'date-fns';
import { useShifts } from '../hooks/useShifts';
import { useJobs } from '../hooks/useJobs';
import { WeekNav } from '../components/WeekNav';
import { ShiftPill } from '../components/ShiftPill';
import { ShiftForm } from '../components/ShiftForm';
import { materializePatterns, saveGeneratedShifts } from '../utils/recurring';
import { detectConflicts } from '../utils/analytics';
import { exportPdf } from '../utils/exportPdf';
import type { Shift } from '../db';

const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

interface WeekViewProps {
  onDayTap: (date: string) => void;
}

export function WeekView({ onDayTap }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const week1Start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const week1End = endOfWeek(currentDate, { weekStartsOn: 1 });
  const week2Start = addWeeks(week1Start, 1);
  const week2End = endOfWeek(week2Start, { weekStartsOn: 1 });

  const week1Days = eachDayOfInterval({ start: week1Start, end: week1End });
  const week2Days = eachDayOfInterval({ start: week2Start, end: week2End });

  const { shifts, addShift, updateShift, deleteShift } = useShifts(week1Start, week2End);
  const { allJobs } = useJobs(true);
  const jobMap = new Map(allJobs.map((j) => [j.id!, j]));

  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    let cancelled = false;
    materializePatterns(week1Start, week2End).then((generated) => {
      if (!cancelled && generated.length > 0) {
        saveGeneratedShifts(generated);
      }
    });
    return () => { cancelled = true; };
  }, [week1Start.toISOString()]);

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 2));
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 2));
  const handleToday = () => setCurrentDate(new Date());

  const handleFabClick = () => {
    setEditingShift(null);
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setShowForm(true);
  };

  const conflicts = detectConflicts(shifts);
  const conflictDates = new Set(conflicts.map((c) => c.date));

  const renderDayCell = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayShifts = shifts
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const isCurrentDay = isToday(day);
    const hasConflict = conflictDates.has(dateStr);

    return (
      <div
        key={dateStr}
        onClick={() => onDayTap(dateStr)}
        style={{
          background: isCurrentDay ? 'rgba(227, 24, 55, 0.06)' : 'transparent',
          borderBottom: '1px solid #F0C0D0',
          borderLeft: isCurrentDay ? '3px solid #E31837' : '3px solid transparent',
          cursor: 'pointer',
          padding: '2px 2px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '2px',
          minHeight: '13vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Date label */}
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: isCurrentDay ? '#E31837' : 'var(--color-tertiary-label)',
          flexShrink: 0,
          width: '20px',
          textAlign: 'center',
        }}>
          {format(day, 'd')}
          {hasConflict && <div style={{ fontSize: '14px', lineHeight: 1 }}>&#9888;</div>}
        </div>
        {/* Shift pills */}
        <div style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {dayShifts.map((shift) => (
            <ShiftPill key={shift.id} shift={shift} job={jobMap.get(shift.jobId)} />
          ))}
        </div>
      </div>
    );
  };

  const handleExport = async () => {
    if (!contentRef.current || exporting) return;
    setExporting(true);
    try {
      const label = `${format(week1Start, 'M.d')}-${format(week2End, 'M.d')}`;
      await exportPdf(contentRef.current, `排班表_${label}.pdf`, `排班表 ${label}`);
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        console.error('Export failed:', err);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="view">
      <div className="view-header">
        <WeekNav
          periodStart={week1Start}
          periodEnd={week2End}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onExport={handleExport}
          exporting={exporting}
        />
      </div>

      <div
        ref={contentRef}
        className="visible-scroll"
        style={{ overflowX: 'hidden', width: '100%' }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '24px 1fr 1fr',
          width: '100%',
          maxWidth: '100%',
        }}>
          {DAY_LABELS.map((label, i) => {
            const day1 = week1Days[i];
            const day2 = week2Days[i];
            return (
              <div key={i} style={{ display: 'contents' }}>
                {/* Day label */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#E31837',
                  background: '#FFF0F5',
                  borderRight: '1px solid #F0C0D0',
                  borderBottom: '1px solid #F0C0D0',
                  minHeight: '13vh',
                }}>
                  {label}
                </div>
                {/* Week 1 cell */}
                {renderDayCell(day1)}
                {/* Week 2 cell */}
                {renderDayCell(day2)}
              </div>
            );
          })}
        </div>
      </div>

      <button className="fab" onClick={handleFabClick}>
        +
      </button>

      <ShiftForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingShift(null); }}
        onSave={addShift}
        onUpdate={updateShift}
        onDelete={deleteShift}
        jobs={allJobs}
        editingShift={editingShift}
        defaultDate={selectedDate}
      />
    </div>
  );
}
