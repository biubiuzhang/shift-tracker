import { useState, useMemo, useRef } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { useShifts } from '../hooks/useShifts';
import { useJobs } from '../hooks/useJobs';
import { computeSummary } from '../utils/analytics';
import { exportPdf } from '../utils/exportPdf';
import { formatDuration, formatCurrency, formatTimeRange } from '../utils/time';

type Period = 'week' | 'month' | 'custom';

export function StatsView() {
  const [period, setPeriod] = useState<Period>('week');
  const [customFrom, setCustomFrom] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [customTo, setCustomTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exporting, setExporting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const { startDate, endDate } = useMemo(() => {
    switch (period) {
      case 'week':
        return {
          startDate: startOfWeek(now, { weekStartsOn: 1 }),
          endDate: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case 'month':
        return {
          startDate: startOfMonth(now),
          endDate: endOfMonth(now),
        };
      case 'custom':
        return {
          startDate: new Date(customFrom + 'T00:00:00'),
          endDate: new Date(customTo + 'T23:59:59'),
        };
    }
  }, [period, customFrom, customTo]);

  const { shifts } = useShifts(startDate, endDate);
  const { allJobs } = useJobs(true);
  const jobMap = new Map(allJobs.map((j) => [j.id!, j]));

  const summary = useMemo(() => computeSummary(shifts, allJobs), [shifts, allJobs]);

  const maxHours = Math.max(...summary.jobSummaries.map((s) => s.hours), 1);

  const handleExport = async () => {
    if (!statsRef.current || exporting) return;
    setExporting(true);
    try {
      const periodLabel = period === 'week' ? '本周' : period === 'month' ? '本月' : `${customFrom}至${customTo}`;
      await exportPdf(statsRef.current, `班次统计_${periodLabel}.pdf`, `班次统计 - ${periodLabel}`);
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
          <h1>统计</h1>
          <button className="btn-text" onClick={handleExport} disabled={exporting}>
            {exporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>

      <div className="scroll-content" ref={statsRef} style={{ padding: '0 16px', paddingBottom: 'calc(var(--tab-bar-height) + var(--safe-bottom) + 80px)' }}>
        {/* Period selector */}
        <div className="period-selector" style={{ marginTop: '12px' }}>
          {(['week', 'month', 'custom'] as Period[]).map((p) => (
            <button
              key={p}
              className={`period-option ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '自定义'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="form-row" style={{ marginBottom: '12px' }}>
            <div className="form-group">
              <label className="form-label">从</label>
              <input
                type="date"
                className="form-input"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">至</label>
              <input
                type="date"
                className="form-input"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(summary.totalHours)}</div>
            <div className="stat-label">总时长</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-blue)' }}>
              {formatCurrency(summary.totalEarnings)}
            </div>
            <div className="stat-label">总收入</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{shifts.length}</div>
            <div className="stat-label">总班次</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: summary.conflicts.length > 0 ? 'var(--color-orange)' : 'var(--color-green)' }}>
              {summary.conflicts.length}
            </div>
            <div className="stat-label">冲突</div>
          </div>
        </div>

        {/* Hours per job */}
        {summary.jobSummaries.length > 0 && (
          <>
            <div className="section-header">各工作时长</div>
            <div className="stat-card">
              <div className="bar-chart">
                {summary.jobSummaries.map((js) => (
                  <div key={js.job.id} className="bar-row">
                    <span className="bar-label">{js.job.name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(js.hours / maxHours) * 100}%`,
                          backgroundColor: js.job.color,
                        }}
                      />
                    </div>
                    <span className="bar-value">{formatDuration(js.hours)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-header">各工作收入</div>
            <div className="stat-card">
              <div className="bar-chart">
                {summary.jobSummaries.map((js) => {
                  const maxEarnings = Math.max(...summary.jobSummaries.map((s) => s.earnings), 1);
                  return (
                    <div key={js.job.id} className="bar-row">
                      <span className="bar-label">{js.job.name}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(js.earnings / maxEarnings) * 100}%`,
                            backgroundColor: js.job.color,
                          }}
                        />
                      </div>
                      <span className="bar-value">{formatCurrency(js.earnings)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Conflicts list */}
        {summary.conflicts.length > 0 && (
          <>
            <div className="section-header">冲突详情</div>
            <div className="card-list">
              {summary.conflicts.map((c, i) => {
                const jobA = jobMap.get(c.shiftA.jobId);
                const jobB = jobMap.get(c.shiftB.jobId);
                return (
                  <div key={i} className="card-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 600 }}>
                      {format(new Date(c.date + 'T00:00:00'), 'M月d日 EEE', { locale: zhCN })}
                    </div>
                    <div style={{ fontSize: '17px', color: 'var(--color-secondary-label)' }}>
                      <span style={{ color: jobA?.color }}>{jobA?.name}</span>
                      {' '}{formatTimeRange(c.shiftA.startTime, c.shiftA.endTime)}
                      {' 与 '}
                      <span style={{ color: jobB?.color }}>{jobB?.name}</span>
                      {' '}{formatTimeRange(c.shiftB.startTime, c.shiftB.endTime)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Per-job breakdown */}
        {summary.jobSummaries.length > 0 && (
          <>
            <div className="section-header">各工作明细</div>
            {summary.jobSummaries.map((js) => (
              <div key={js.job.id} className="card" style={{ borderLeft: `4px solid ${js.job.color}` }}>
                <div style={{ fontWeight: 600, fontSize: '22px', marginBottom: '8px' }}>
                  {js.job.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{js.shiftCount}</div>
                    <div style={{ fontSize: '16px', color: 'var(--color-secondary-label)' }}>班次</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{formatDuration(js.hours)}</div>
                    <div style={{ fontSize: '16px', color: 'var(--color-secondary-label)' }}>时长</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-blue)' }}>{formatCurrency(js.earnings)}</div>
                    <div style={{ fontSize: '16px', color: 'var(--color-secondary-label)' }}>收入</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {shifts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">&#128202;</div>
            <div className="empty-state-title">暂无数据</div>
            <div className="empty-state-text">
              添加班次后查看统计分析
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
