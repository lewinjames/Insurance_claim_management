import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function FeedbackAlert({ type = 'info', message, onDismiss }) {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`flex items-start justify-between p-4 mb-4 border rounded-lg ${current.bg} transition-all`}>
      <div className="flex items-center gap-3">
        {current.icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
