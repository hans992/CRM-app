interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function KPICard({ title, value, subtitle, className = "" }: KPICardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}
