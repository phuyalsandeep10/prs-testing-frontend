import React, { memo } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

// Memoize the component to prevent unnecessary re-renders
const StatsCard: React.FC<StatsCardProps> = memo(({ title, value }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
