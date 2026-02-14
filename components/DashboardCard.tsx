import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'teal' | 'blue' | 'amber' | 'rose' | 'emerald' | 'purple';
}

const colorVariants = {
  teal: {
    bg: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    trend: 'text-teal-600',
  },
  blue: {
    bg: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    trend: 'text-blue-600',
  },
  amber: {
    bg: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    trend: 'text-amber-600',
  },
  rose: {
    bg: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    trend: 'text-rose-600',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    trend: 'text-emerald-600',
  },
  purple: {
    bg: 'from-purple-500 to-indigo-500',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    trend: 'text-purple-600',
  },
};

export default function DashboardCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color 
}: DashboardCardProps) {
  const colors = colorVariants[color];

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group">
      
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-linear-to-br ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-800 mb-1">
              {value}
            </p>
            {trend && (
              <p className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>

          <div className={`${colors.iconBg} p-3 rounded-xl shadow-sm`}>
            <Icon size={24} className={colors.iconColor} />
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className={`h-1 bg-linear-to-r{colors.bg}`} />
    </div>
  );
}