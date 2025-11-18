import React, { useState, useEffect, useCallback } from 'react';
import PremiseInput from './components/PremiseInput';
import OutlineDisplay from './components/OutlineDisplay';
import CharacterArcsDisplay from './components/CharacterArcsDisplay';
import ChapterView from './components/ChapterView';
import { BookIcon, QuillIcon, DownloadIcon } from './components/icons';
import { AppState, StoryData, SavedStoryState } from './types';
import { generateOutlineAndArcs, generateChapter } from './services/geminiService';
import { saveStoryState, loadStoryState, clearStoryState } from './services/storageService';
import { exportAsTxt, exportAsPdf } from './services/exportService';


const App: React.FC = () => {
  const initialStoryState = loadStoryState();

  const [appState, setAppState] = useState<AppState>(initialStoryState?.appState ?? AppState.PREMISE);
  const [premise, setPremise] = useState<string>(initialStoryState?.premise ?? '');
  const [storyData, setStoryData] = useState<StoryData | null>(initialStoryState?.storyData ?? null);
  const [chapters, setChapters] = useState<string[]>(initialStoryState?.chapters ?? []);
  const [currentWritingChapter, setCurrentWritingChapter] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);


  // Effect to save state to local storage
  useEffect(() => {
    const stateToSave: SavedStoryState = {
      // If app is closed during outline generation, revert to premise input to avoid getting stuck.
      appState: appState === AppState.GENERATING_OUTLINE ? AppState.PREMISE : appState,
      premise,
      storyData,
      chapters,
    };
    saveStoryState(stateToSave);
  }, [appState, premise, storyData, chapters]);


  const handlePremiseSubmit = async (submittedPremise: string) => {
    setPremise(submittedPremise);
    setAppState(AppState.GENERATING_OUTLINE);
    setError(null);
    try {
      const data = await generateOutlineAndArcs(submittedPremise);
      setStoryData(data);
      setAppState(AppState.DISPLAY_OUTLINE);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      setAppState(AppState.PREMISE);
    }
  };
  
  const startWritingProcess = useCallback(async () => {
    if (!storyData) return;
    
    let generatedChapters: string[] = [...chapters];
    
    for (let i = chapters.length; i < 10; i++) {
        setCurrentWritingChapter(i);
        try {
            const chapterContent = await generateChapter({
                chapterIndex: i + 1,
                outline: storyData.outline,
                characterArcs: storyData.characterArcs,
                previousChapters: generatedChapters,
            });
            generatedChapters = [...generatedChapters, chapterContent];
            setChapters(generatedChapters);
        } catch (e) {
            console.error("Failed to generate chapter", i + 1, e);
            setError(`An error occurred while writing chapter ${i + 1}. Please try again.`);
            setAppState(AppState.DISPLAY_OUTLINE); // Revert to outline view
            setCurrentWritingChapter(null);
            return;
        }
    }
    
    setCurrentWritingChapter(null);
    setAppState(AppState.COMPLETED);
  }, [storyData, chapters]);
  
  useEffect(() => {
    if (appState === AppState.GENERATING_CHAPTERS) {
      // Ensure we don't start writing if already completed
      if (chapters.length < 10) {
        startWritingProcess();
      } else {
        setAppState(AppState.COMPLETED);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, startWritingProcess]);
  

  const handleStartWriting = () => {
    setAppState(AppState.GENERATING_CHAPTERS);
  };

  const handleReset = () => {
    clearStoryState();
    setAppState(AppState.PREMISE);
    setPremise('');
    setStoryData(null);
    setChapters([]);
    setError(null);
    setCurrentWritingChapter(null);
  }

  const handleExportTxt = () => {
    if (!storyData) return;
    try {
      exportAsTxt(premise, storyData, chapters);
    } catch (e) {
      console.error("TXT Export failed", e);
      setError("Sorry, there was an error exporting your story as a .txt file.");
    }
  };

  const handleExportPdf = () => {
    if (!storyData || isExporting) return;
    setIsExporting(true);
    // Use a short timeout to allow the UI to update to the "exporting" state
    // before the potentially blocking PDF generation begins.
    setTimeout(() => {
      try {
        exportAsPdf(premise, storyData, chapters);
      } catch (e) {
        console.error("PDF Export failed", e);
        setError("Sorry, there was an error exporting your story as a PDF.");
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4">
            <BookIcon className="w-10 h-10 text-indigo-500" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              AI Story Weaver
            </h1>
            <QuillIcon className="w-10 h-10 text-indigo-500" />
          </div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            From a simple idea to a complete novel.
          </p>
        </header>

        <main>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {appState === AppState.PREMISE && (
            <PremiseInput onSubmit={handlePremiseSubmit} isLoading={false} />
          )}

          {appState === AppState.GENERATING_OUTLINE && (
             <PremiseInput onSubmit={handlePremiseSubmit} isLoading={true} />
          )}

          {storyData && (appState === AppState.DISPLAY_OUTLINE || appState === AppState.GENERATING_CHAPTERS || appState === AppState.COMPLETED) && (
            <div className="space-y-8">
              {appState === AppState.DISPLAY_OUTLINE && (
                <>
                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <OutlineDisplay outline={storyData.outline} />
                    <CharacterArcsDisplay characterArcs={storyData.characterArcs} />
                  </div>
                  <div className="text-center">
                    <button
                      onClick={handleStartWriting}
                      className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Write My Book
                    </button>
                  </div>
                </>
              )}

              {(appState === AppState.GENERATING_CHAPTERS || appState === AppState.COMPLETED) && (
                <>
                <ChapterView 
                  chapters={chapters} 
                  outline={storyData.outline} 
                  currentWritingChapter={currentWritingChapter}
                  totalChapters={10}
                />
                {appState === AppState.COMPLETED && (
                    <div className="text-center pt-8">
                        <h2 className="text-3xl font-bold text-emerald-500 mb-4">Your Story is Complete!</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                            <button
                                onClick={handleExportTxt}
                                disabled={isExporting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-wait transition-all duration-300"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>Export as .txt</span>
                            </button>
                             <button
                                onClick={handleExportPdf}
                                disabled={isExporting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-700 disabled:bg-rose-400 disabled:cursor-wait transition-all duration-300"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>Export as .pdf</span>
                            </button>
                        </div>
                         {isExporting && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Preparing your file...</p>}
                        <div className="mt-8">
                             <button
                              onClick={handleReset}
                              className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-all duration-300 text-sm"
                            >
                              Start a New Story
                            </button>
                        </div>
                    </div>
                )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;