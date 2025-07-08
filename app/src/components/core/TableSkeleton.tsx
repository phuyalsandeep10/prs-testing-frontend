import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

/**
 * Simple grey pulse rows to indicate loading in tables.
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 10, cols = 6 }) => {
  const skeletonRows = Array.from({ length: rows });
  const skeletonCols = Array.from({ length: cols });

  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {skeletonRows.map((_, rowIdx) => (
        <div key={rowIdx} className="flex">
          {skeletonCols.map((_, colIdx) => (
            <div key={colIdx} className="px-6 py-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton; 