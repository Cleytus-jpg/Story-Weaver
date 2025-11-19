
import React, { useState } from 'react';
import { SparklesIcon, LoaderIcon } from './icons';

interface PremiseInputProps {
  onSubmit: (premise: string) => void;
  isLoading: boolean;
}

const examplePremises = [
  {
    title: "Alex's Cosmic Journey",
    premise: "In a small college town, Alex, a neuroscience student struggling with existential questions about consciousness and reality, discovers DMT—the 'spirit molecule'—through a mysterious underground research group. As Alex ventures into hyperspace through carefully guided experiences, they encounter impossible geometric entities, receive profound cosmic downloads about the nature of existence, and begin to question whether these visions are mere hallucinations or glimpses into hidden dimensions of reality. The journey transforms from scientific curiosity into a spiritual awakening that challenges everything Alex thought they knew about consciousness, death, and the fabric of the universe itself."
  },
  {
    title: "The Librarian's Magic",
    premise: "A young librarian in a dystopian future discovers a hidden book that contains the secrets to overthrowing the oppressive regime, but reading it awakens a forgotten magic within her."
  },
  {
    title: "The Last Starship",
    premise: "The last generation ship carrying humanity's survivors arrives at a new world, only to find it already inhabited by their own descendants from a faster ship that arrived centuries ago."
  },
  {
    title: "The Memory Thief",
    premise: "A detective with the ability to experience other people's memories must solve a murder where the victim's memories were completely erased before death."
  }
];

const PremiseInput: React.FC<PremiseInputProps> = ({ onSubmit, isLoading }) => {
  const [premise, setPremise] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (premise.trim() && !isLoading) {
      onSubmit(premise);
    }
  };

  const loadExample = (examplePremise: string) => {
    setPremise(examplePremise);
    setShowExamples(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-full">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Start Your Story</h2>
            <p className="text-slate-500 dark:text-slate-400">Describe your idea, and let the AI build the world.</p>
          </div>
        </div>

        {/* Example Presets Section */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            disabled={isLoading}
          >
            {showExamples ? '▼' : '▶'} {showExamples ? 'Hide' : 'Show'} Example Story Ideas
          </button>
          
          {showExamples && (
            <div className="mt-3 grid gap-2">
              {examplePremises.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => loadExample(example.premise)}
                  disabled={isLoading}
                  className="text-left p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600"
                >
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{example.title}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{example.premise}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            placeholder="For example: A young librarian in a dystopian future discovers a hidden book that contains the secrets to overthrowing the oppressive regime, but reading it awakens a forgotten magic within her..."
            className="w-full h-40 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !premise.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="w-5 h-5 animate-spin" />
                <span>Generating Structure...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                <span>Weave My Story</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PremiseInput;
