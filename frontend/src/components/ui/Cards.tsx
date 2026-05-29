'use client';

import { ReactNode } from 'react';

/**
 * Reusable Card component with modern subtle glass aesthetics
 */
export function Card({ 
  children, 
  className = '',
  title,
  subtitle,
  action
}: { 
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`bg-[#181b21] border border-white/5 rounded-xl shadow-sm ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/**
 * Reusable metric card
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string; positive: boolean };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  return (
    <div className="bg-[#181b21] border border-white/5 rounded-xl p-5 hover:bg-[#1c1f26] transition-colors group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1 group-hover:text-blue-50 transition-colors">{value}</h4>
        </div>
        <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`font-medium ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
