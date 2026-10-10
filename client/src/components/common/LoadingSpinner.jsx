import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`animate-spin text-teal-600 ${size === 'small' ? 'w-5 h-5' : 'w-8 h-8'}`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};
