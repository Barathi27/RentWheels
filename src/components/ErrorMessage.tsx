import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <p className="text-sm text-red-700">{message}</p>
        <p className="text-sm text-red-600 mt-1">
          Please ensure you've connected to Supabase by clicking the "Connect to Supabase" button in the top right.
        </p>
      </div>
    </div>
  );
}