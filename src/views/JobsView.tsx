import { useState, useRef } from 'react';
import { useJobs } from '../hooks/useJobs';
import { JobBadge } from '../components/JobBadge';
import { BottomSheet } from '../components/BottomSheet';
import { exportPdf } from '../utils/exportPdf';
import type { Job } from '../db';
import { formatCurrency } from '../utils/time';

const COLOR_PALETTE = [
  '#E31837', '#FF69B4', '#1A1A1A', '#9B59B6',
  '#2FA572', '#FFD700', '#3AAFCF', '#E8923E',
];

export function JobsView() {
  const { allJobs, addJob, updateJob, toggleArchive } = useJobs(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [payRateStr, setPayRateStr] = useState('25');
  const [payType, setPayType] = useState<'hourly' | 'fixed'>('hourly');

  const openAdd = () => {
    setEditingJob(null);
    setName('');
    setColor(COLOR_PALETTE[0]);
    setPayRateStr('25');
    setPayType('hourly');
    setShowForm(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setName(job.name);
    setColor(job.color);
    setPayRateStr(String(job.defaultPayRate));
    setPayType(job.payType);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingJob?.id) {
      await updateJob(editingJob.id, {
        name: name.trim(),
        color,
        defaultPayRate: parseFloat(payRateStr) || 0,
        payType,
      });
    } else {
      await addJob({
        name: name.trim(),
        color,
        defaultPayRate: parseFloat(payRateStr) || 0,
        payType,
        archived: false,
      });
    }
    setShowForm(false);
  };

  const activeJobs = allJobs.filter((j) => !j.archived);
  const archivedJobs = allJobs.filter((j) => j.archived);

  const handleExport = async () => {
    if (!contentRef.current || exporting) return;
    setExporting(true);
    try {
      await exportPdf(contentRef.current, '工作列表.pdf', '工作列表');
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
        <div className="view-header-row">
          <h1>工作</h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-text" onClick={handleExport} disabled={exporting}>
              {exporting ? '导出中...' : '导出'}
            </button>
            <button className="btn-text" onClick={openAdd}>
              + 添加
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-content" ref={contentRef}>
        {activeJobs.length === 0 && archivedJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128188;</div>
            <div className="empty-state-title">暂无工作</div>
            <div className="empty-state-text">
              添加第一份工作来开始记录排班
            </div>
            <button
              className="btn btn-primary"
              onClick={openAdd}
              style={{ marginTop: '16px', width: 'auto' }}
            >
              添加工作
            </button>
          </div>
        ) : (
          <>
            {activeJobs.length > 0 && (
              <>
                <div className="section-header">进行中</div>
                <div className="card-list">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="card-list-item"
                      onClick={() => openEdit(job)}
                      style={{ cursor: 'pointer' }}
                    >
                      <JobBadge name={job.name} color={job.color} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '22px' }}>{job.name}</div>
                        <div style={{ color: 'var(--color-secondary-label)', fontSize: '18px' }}>
                          {formatCurrency(job.defaultPayRate)}
                          {job.payType === 'hourly' ? '/时' : '/班'}
                        </div>
                      </div>
                      <span style={{ color: 'var(--color-tertiary-label)', fontSize: '24px' }}>&#8250;</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {archivedJobs.length > 0 && (
              <>
                <div className="section-header">已归档</div>
                <div className="card-list">
                  {archivedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="card-list-item"
                      style={{ opacity: 0.5, cursor: 'pointer' }}
                      onClick={() => openEdit(job)}
                    >
                      <JobBadge name={job.name} color={job.color} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '22px' }}>{job.name}</div>
                        <div style={{ color: 'var(--color-secondary-label)', fontSize: '18px' }}>
                          已归档
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingJob ? '编辑工作' : '添加工作'}
      >
        <div className="form-group">
          <label className="form-label">名称</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="公司名称..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">颜色</label>
          <div className="color-palette">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
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

        <button className="btn btn-primary" onClick={handleSave}>
          {editingJob ? '更新工作' : '保存工作'}
        </button>

        {editingJob && (
          <button
            className="btn btn-secondary"
            onClick={async () => {
              await toggleArchive(editingJob.id!);
              setShowForm(false);
            }}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {editingJob.archived ? '取消归档' : '归档'}
          </button>
        )}
      </BottomSheet>
    </div>
  );
}
