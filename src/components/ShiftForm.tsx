import { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { JobBadge } from './JobBadge';
import type { Shift, Job } from '../db';

interface ShiftFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (shift: Omit<Shift, 'id'>) => void;
  onUpdate: (id: number, shift: Partial<Shift>) => void;
  onDelete: (id: number) => void;
  jobs: Job[];
  editingShift: Shift | null;
  defaultDate: string;
}

export function ShiftForm({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  jobs,
  editingShift,
  defaultDate,
}: ShiftFormProps) {
  const [jobId, setJobId] = useState<number | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [payRateStr, setPayRateStr] = useState('0');
  const [payType, setPayType] = useState<'hourly' | 'fixed'>('hourly');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingShift) {
      setJobId(editingShift.jobId);
      setDate(editingShift.date);
      setStartTime(editingShift.startTime);
      setEndTime(editingShift.endTime);
      setPayRateStr(String(editingShift.payRate));
      setPayType(editingShift.payType);
      setNotes(editingShift.notes);
    } else {
      setDate(defaultDate);
      setStartTime('09:00');
      setEndTime('17:00');
      setNotes('');
      // Select first available job
      const activeJobs = jobs.filter((j) => !j.archived);
      if (activeJobs.length > 0 && !jobId) {
        setJobId(activeJobs[0].id!);
        setPayRateStr(String(activeJobs[0].defaultPayRate));
        setPayType(activeJobs[0].payType);
      }
    }
  }, [editingShift, defaultDate, open]);

  const handleJobSelect = (job: Job) => {
    setJobId(job.id!);
    if (!editingShift) {
      setPayRateStr(String(job.defaultPayRate));
      setPayType(job.payType);
    }
  };

  const handleSave = () => {
    if (!jobId) return;

    const data = {
      jobId,
      date,
      startTime,
      endTime,
      payRate: parseFloat(payRateStr) || 0,
      payType,
      notes,
    };

    if (editingShift?.id) {
      onUpdate(editingShift.id, data);
    } else {
      onSave(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingShift?.id) {
      onDelete(editingShift.id);
      onClose();
    }
  };

  const activeJobs = jobs.filter((j) => !j.archived);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editingShift ? '编辑班次' : '添加班次'}
    >
      {activeJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">暂无工作</div>
          <div className="empty-state-text">
            请先在「工作」页面添加工作
          </div>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">工作</label>
            <div className="job-selector">
              {activeJobs.map((job) => (
                <button
                  key={job.id}
                  className={`job-selector-item ${jobId === job.id ? 'selected' : ''}`}
                  onClick={() => handleJobSelect(job)}
                >
                  <JobBadge name={job.name} color={job.color} />
                  <span className="job-name">{job.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">日期</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">开始时间</label>
              <input
                type="time"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">结束时间</label>
              <input
                type="time"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">时薪/固定薪资 ($)</label>
              <input
                type="number"
                className="form-input"
                value={payRateStr}
                onChange={(e) => setPayRateStr(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">薪资类型</label>
              <select
                className="form-input"
                value={payType}
                onChange={(e) => setPayType(e.target.value as 'hourly' | 'fixed')}
              >
                <option value="hourly">按小时</option>
                <option value="fixed">按班次</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="选填备注..."
              rows={2}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSave}>
            {editingShift ? '更新班次' : '保存班次'}
          </button>

          {editingShift && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              style={{ marginTop: '8px' }}
            >
              删除班次
            </button>
          )}
        </>
      )}
    </BottomSheet>
  );
}
