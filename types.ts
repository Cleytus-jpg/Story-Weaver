
export interface StoryData {
  outline: string[];
  characterArcs: string;
}

export enum AppState {
  PREMISE,
  GENERATING_OUTLINE,
  DISPLAY_OUTLINE,
  GENERATING_CHAPTERS,
  COMPLETED,
}

export interface SavedStoryState {
  appState: AppState;
  premise: string;
  storyData: StoryData | null;
  chapters: string[];
}
