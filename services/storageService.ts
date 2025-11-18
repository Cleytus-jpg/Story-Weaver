
import { SavedStoryState } from '../types';

const STORAGE_KEY = 'ai-story-weaver-data';

export function saveStoryState(state: SavedStoryState): void {
  try {
    const stateString = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, stateString);
  } catch (error) {
    console.error("Could not save story state to local storage", error);
  }
}

export function loadStoryState(): SavedStoryState | null {
  try {
    const stateString = localStorage.getItem(STORAGE_KEY);
    if (stateString === null) {
      return null;
    }
    return JSON.parse(stateString) as SavedStoryState;
  } catch (error) {
    console.error("Could not load story state from local storage", error);
    // If parsing fails, the data is likely corrupt. Clear it.
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearStoryState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Could not clear story state from local storage", error);
  }
}
