interface JobBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function JobBadge({ name, color, size = 'md' }: JobBadgeProps) {
  const sizeClass = size === 'sm' ? 'job-badge-sm' : size === 'lg' ? 'job-badge-lg' : '';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`job-badge ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
