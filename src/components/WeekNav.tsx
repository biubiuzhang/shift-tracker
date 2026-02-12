import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

interface WeekNavProps {
  periodStart: Date;
  periodEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onExport?: () => void;
  exporting?: boolean;
}

export function WeekNav({ periodStart, periodEnd, onPrev, onNext, onToday, onExport, exporting }: WeekNavProps) {
  const sameYear = periodStart.getFullYear() === periodEnd.getFullYear();

  let label: string;
  if (sameYear) {
    label = `${format(periodStart, 'M月d日', { locale: zhCN })} – ${format(periodEnd, 'M月d日', { locale: zhCN })}`;
  } else {
    label = `${format(periodStart, 'yyyy年M月d日', { locale: zhCN })} – ${format(periodEnd, 'yyyy年M月d日', { locale: zhCN })}`;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0',
    }}>
      {onExport && (
        <button
          onClick={onExport}
          disabled={exporting}
          style={{
            padding: '2px 8px',
            fontSize: '14px',
            minHeight: 'auto',
            width: 'auto',
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: exporting ? 0.5 : 1,
          }}
        >
          {exporting ? '导出中' : '导出'}
        </button>
      )}
      <button
        onClick={onPrev}
        style={{
          fontSize: '24px',
          padding: '2px 6px',
          color: 'rgba(255, 255, 255, 0.8)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        &#8249;
      </button>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>
          {label}
        </div>
      </div>
      <button
        onClick={onNext}
        style={{
          fontSize: '24px',
          padding: '2px 6px',
          color: 'rgba(255, 255, 255, 0.8)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        &#8250;
      </button>
      <button
        onClick={onToday}
        style={{
          padding: '2px 8px',
          fontSize: '14px',
          minHeight: 'auto',
          width: 'auto',
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        今天
      </button>
    </div>
  );
}
