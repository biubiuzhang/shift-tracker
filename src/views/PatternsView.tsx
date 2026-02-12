import { useState } from 'react';
import { useRecurring } from '../hooks/useRecurring';
import { useJobs } from '../hooks/useJobs';
import { BottomSheet } from '../components/BottomSheet';
import { JobBadge } from '../components/JobBadge';
import { formatTimeRange } from '../utils/time';
import type { RecurringPattern } from '../db';

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export function PatternsView() {
  const { patterns, addPattern, updatePattern, deletePattern } = useRecurring();
  const { allJobs } = useJobs(true);
  const activeJobs = allJobs.filter((j) => !j.archived);
  const jobMap = new Map(allJobs.map((j) => [j.id!, j]));

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringPattern | null>(null);

  const [jobId, setJobId] = useState<number | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [effectiveFrom, setEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [effectiveTo, setEffectiveTo] = useState('');

  const openAdd = () => {
    setEditing(null);
    setJobId(activeJobs[0]?.id ?? null);
    setDaysOfWeek([]);
    setStartTime('09:00');
    setEndTime('17:00');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setEffectiveTo('');
    setShowForm(true);
  };

  const openEdit = (pattern: RecurringPattern) => {
    setEditing(pattern);
    setJobId(pattern.jobId);
    setDaysOfWeek([...pattern.daysOfWeek]);
    setStartTime(pattern.startTime);
    setEndTime(pattern.endTime);
    setEffectiveFrom(pattern.effectiveFrom);
    setEffectiveTo(pattern.effectiveTo ?? '');
    setShowForm(true);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    if (!jobId || daysOfWeek.length === 0) return;

    const data = {
      jobId,
      daysOfWeek,
      startTime,
      endTime,
      effectiveFrom,
      effectiveTo: effectiveTo || undefined,
    };

    if (editing?.id) {
      await updatePattern(editing.id, data);
    } else {
      await addPattern(data as Omit<RecurringPattern, 'id'>);
    }
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (editing?.id) {
      await deletePattern(editing.id);
      setShowForm(false);
    }
  };

  // Group patterns by job
  const grouped = new Map<number, RecurringPattern[]>();
  for (const p of patterns) {
    const arr = grouped.get(p.jobId) || [];
    arr.push(p);
    grouped.set(p.jobId, arr);
  }

  return (
    <div className="view">
      <div className="view-header">
        <div className="view-header-row">
          <h1>排班规律</h1>
          <button className="btn-text" onClick={openAdd}>
            + 添加
          </button>
        </div>
      </div>

      <div className="scroll-content">
        {patterns.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128260;</div>
            <div className="empty-state-title">暂无排班规律</div>
            <div className="empty-state-text">
              设置重复排班，自动填充你的日程表
            </div>
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ marginTop: '16px', width: 'auto' }}
            >
              添加规律
            </button>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([jId, jobPatterns]) => {
            const job = jobMap.get(jId);
            return (
              <div key={jId}>
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {job && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: job.color,
                      }}
                    />
                  )}
                  {job?.name ?? '未知工作'}
                </div>
                <div className="card-list">
                  {jobPatterns.map((pattern) => (
                    <div
                      key={pattern.id}
                      className="card-list-item"
                      onClick={() => openEdit(pattern)}
                      style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}
                    >
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {pattern.daysOfWeek
                          .sort((a, b) => a - b)
                          .map((d) => (
                            <span
                              key={d}
                              style={{
                                background: job?.color ?? '#999',
                                color: 'white',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '16px',
                                fontWeight: 600,
                              }}
                            >
                              {DAY_LABELS[d]}
                            </span>
                          ))}
                      </div>
                      <div style={{ fontSize: '20px', color: 'var(--color-secondary-label)' }}>
                        {formatTimeRange(pattern.startTime, pattern.endTime)}
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--color-tertiary-label)' }}>
                        从 {pattern.effectiveFrom} 起
                        {pattern.effectiveTo && ` 至 ${pattern.effectiveTo}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? '编辑规律' : '添加规律'}
      >
        <div className="form-group">
          <label className="form-label">工作</label>
          <div className="job-selector">
            {activeJobs.map((job) => (
              <button
                key={job.id}
                className={`job-selector-item ${jobId === job.id ? 'selected' : ''}`}
                onClick={() => setJobId(job.id!)}
              >
                <JobBadge name={job.name} color={job.color} />
                <span className="job-name">{job.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">星期</label>
          <div className="day-toggles">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                className={`day-toggle ${daysOfWeek.includes(i) ? 'active' : ''}`}
                onClick={() => toggleDay(i)}
              >
                {label.charAt(0)}
              </button>
            ))}
          </div>
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
            <label className="form-label">生效日期</label>
            <input
              type="date"
              className="form-input"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">截止日期</label>
            <input
              type="date"
              className="form-input"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              placeholder="长期"
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          {editing ? '更新规律' : '保存规律'}
        </button>

        {editing && (
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            style={{ marginTop: '8px' }}
          >
            删除规律
          </button>
        )}
      </BottomSheet>
    </div>
  );
}
