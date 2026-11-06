import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading records...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 gap-3 text-gray-500">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
