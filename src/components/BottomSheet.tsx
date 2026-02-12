import type { ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <>
      <div
        className={`sheet-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`bottom-sheet ${open ? 'open' : ''}`}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{title}</h2>
          <button className="btn-text" onClick={onClose}>
            完成
          </button>
        </div>
        <div className="sheet-body">
          {children}
        </div>
      </div>
    </>
  );
}
