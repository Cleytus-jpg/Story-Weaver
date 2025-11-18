
import React, { useState } from 'react';
import { LoaderIcon } from './icons';

interface ChapterViewProps {
  chapters: string[];
  outline: string[];
  currentWritingChapter: number | null;
  totalChapters: number;
}

const ChapterView: React.FC<ChapterViewProps> = ({ chapters, outline, currentWritingChapter, totalChapters }) => {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);

  const getStatus = (index: number) => {
    if (index < chapters.length) {
      return { text: 'Completed', color: 'bg-emerald-500' };
    }
    if (index === currentWritingChapter) {
      return { text: 'Writing...', color: 'bg-indigo-500 animate-pulse' };
    }
    return { text: 'Pending', color: 'bg-slate-400' };
  };

  const progress = (chapters.length / totalChapters) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
        <div>
            <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Your Story is Unfolding</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">The AI is now writing your book, chapter by chapter.</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                <div 
                    className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2 font-semibold">{chapters.length} / {totalChapters} Chapters Completed</p>
        </div>

        <div className="space-y-4">
            {Array.from({ length: totalChapters }).map((_, index) => {
                const status = getStatus(index);
                const isCompleted = index < chapters.length;
                const isExpanded = expandedChapter === index;

                return (
                    <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all duration-300">
                        <button 
                            onClick={() => setExpandedChapter(isExpanded ? null : index)}
                            disabled={!isCompleted}
                            className="w-full p-4 flex items-center justify-between text-left disabled:cursor-default"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">Chapter {index + 1}</span>
                                <span className="hidden md:inline text-slate-500 dark:text-slate-400 ">{outline[index]}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {status.text === 'Writing...' && <LoaderIcon className="w-5 h-5 animate-spin text-indigo-500" />}
                                {isCompleted && (
                                     <svg className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </div>
                        </button>
                        {isExpanded && isCompleted && (
                            <div className="p-6 md:p-8 border-t border-slate-200 dark:border-slate-700">
                                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
                                    {chapters[index]}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default ChapterView;
