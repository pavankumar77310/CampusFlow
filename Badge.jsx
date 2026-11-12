import React from 'react';

const BADGE_STYLES = {
  // Booking / Registration statuses
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  registered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  
  // Event statuses
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  ongoing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',

  // Priorities
  urgent: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
  high: 'bg-orange-50 text-orange-700 border-orange-200 font-semibold',
  medium: 'bg-sky-50 text-sky-700 border-sky-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',

  // Roles
  admin: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
  faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
  student: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',

  // Operational status
  operational: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'under maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  'out of order': 'bg-rose-50 text-rose-700 border-rose-200',
};

export const Badge = ({ value, label, size = 'sm', className = '' }) => {
  const normalized = String(value || label || '').toLowerCase().trim();
  const style = BADGE_STYLES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const displayLabel = label || value || '';

  const sizeClass = size === 'xs' 
    ? 'text-[11px] px-2 py-0.5' 
    : size === 'md' 
    ? 'text-sm px-3 py-1' 
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center capitalize tracking-wide rounded-full border ${sizeClass} ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5"></span>
      {displayLabel}
    </span>
  );
};

export default Badge;
