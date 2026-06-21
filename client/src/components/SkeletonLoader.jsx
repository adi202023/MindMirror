import React from 'react';

export default function SkeletonLoader({ type = 'card', rows = 3 }) {
  if (type === 'card') {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="skeleton h-4 w-1/3 mb-4 rounded" />
        <div className="skeleton h-8 w-1/2 mb-2 rounded" />
        <div className="skeleton h-3 w-full mb-1 rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="skeleton h-3 w-20 mb-3 rounded" />
        <div className="skeleton h-8 w-24 mb-2 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <tr>
        {Array.from({ length: rows }).map((_, i) => (
          <td key={i} className="px-4 py-3">
            <div className="skeleton h-4 rounded" style={{ width: `${60 + i * 10}%` }} />
          </td>
        ))}
      </tr>
    );
  }

  if (type === 'biomarker') {
    return (
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(30, 33, 48, 0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="skeleton w-8 h-8 rounded-lg" />
          <div className="flex-1">
            <div className="skeleton h-3 w-3/4 mb-1 rounded" />
            <div className="skeleton h-2 w-1/2 rounded" />
          </div>
          <div className="skeleton h-6 w-10 rounded" />
        </div>
        <div className="skeleton h-1.5 w-full rounded-full" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div
        className="p-6 rounded-2xl"
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="skeleton h-4 w-1/4 mb-6 rounded" />
        <div className="skeleton w-full rounded" style={{ height: '240px' }} />
      </div>
    );
  }

  return null;
}
