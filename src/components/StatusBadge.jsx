import React from 'react';

export default function StatusBadge({ status, type = 'claim' }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Settled':
      case 'Paid':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Expired':
      case 'Terminated':
      case 'Failed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500';
      case 'Under Review':
      case 'Pending':
        return 'bg-amber-500';
      case 'Approved':
      case 'Active':
        return 'bg-emerald-500';
      case 'Rejected':
      case 'Failed':
        return 'bg-rose-500';
      case 'Settled':
      case 'Paid':
        return 'bg-purple-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`}></span>
      {status || 'Unknown'}
    </span>
  );
}
