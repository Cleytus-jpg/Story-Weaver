
import React from 'react';
import { BookIcon } from './icons';

interface OutlineDisplayProps {
  outline: string[];
}

const OutlineDisplay: React.FC<OutlineDisplayProps> = ({ outline }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-full">
          <BookIcon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chapter Outline</h3>
      </div>
      <ol className="space-y-4">
        {outline.map((summary, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 h-8 w-8 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-full flex items-center justify-center">
              {index + 1}
            </div>
            <p className="text-slate-600 dark:text-slate-300 pt-1">{summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default OutlineDisplay;
