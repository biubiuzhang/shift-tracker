interface ConflictBannerProps {
  count: number;
}

export function ConflictBanner({ count }: ConflictBannerProps) {
  if (count === 0) return null;

  return (
    <div className="conflict-banner">
      <span className="conflict-icon">&#9888;</span>
      <span className="conflict-text">
        {count === 1
          ? '检测到 1 个排班冲突'
          : `检测到 ${count} 个排班冲突`}
      </span>
    </div>
  );
}
