
import React from 'react';
import { QuillIcon } from './icons';

interface CharacterArcsDisplayProps {
  characterArcs: string;
}

const CharacterArcsDisplay: React.FC<CharacterArcsDisplayProps> = ({ characterArcs }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
       <div className="flex items-center gap-4 mb-6">
        <div className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-full">
          <QuillIcon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Character Arcs</h3>
      </div>
      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
        {characterArcs}
      </p>
    </div>
  );
};

export default CharacterArcsDisplay;
