
import { GoogleGenAI, Type } from "@google/genai";
import { StoryData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function generateOutlineAndArcs(premise: string): Promise<StoryData> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following story premise, generate a detailed 10-chapter outline and comprehensive character arcs for the main characters.
      Premise: "${premise}"
      
      The output must be in JSON format. The JSON should have two keys: 
      1. "outline": an array of 10 strings, where each string is a concise summary for one chapter.
      2. "characterArcs": a string describing the arcs of the main characters throughout the story.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A 10-item array, where each item is a summary of a chapter.",
            },
            characterArcs: {
              type: Type.STRING,
              description: "A detailed description of the character arcs."
            }
          }
        },
      },
    });

    const jsonString = response.text;
    const data: StoryData = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error("Error generating outline and arcs:", error);
    throw new Error("Failed to generate story structure. Please try again.");
  }
}

interface ChapterGenerationParams {
  chapterIndex: number;
  outline: string[];
  characterArcs: string;
  previousChapters: string[];
}

export async function generateChapter({
  chapterIndex,
  outline,
  characterArcs,
  previousChapters,
}: ChapterGenerationParams): Promise<string> {
  const previousChaptersContext = previousChapters.map((content, index) => `Chapter ${index + 1}:\n${content}`).join('\n\n---\n\n');
  
  const prompt = `You are a master storyteller. Your task is to write Chapter ${chapterIndex} of a novel.

  **Overall Story Outline:**
  ${outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

  **Character Arcs to Adhere To:**
  ${characterArcs}

  **Context from Previous Chapters:**
  ${previousChapters.length > 0 ? previousChaptersContext : 'This is the first chapter.'}

  **This Chapter's Focus (from Outline):**
  "${outline[chapterIndex - 1]}"

  Now, write the full, engaging, and well-detailed content for Chapter ${chapterIndex}. Ensure it flows logically from the previous chapters and builds towards the next part of the outline. Write only the chapter content itself, without any introductory or concluding remarks about the writing process.`;
  
  const maxRetries = 3;
  let attempt = 0;
  let backoffDelay = 2000; // start with 2 seconds

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
      });
      return response.text;
    } catch (error: any) {
      attempt++;
      // Check if it's a rate limit error
      const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error);
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        if (attempt >= maxRetries) {
          console.error(`Error generating chapter ${chapterIndex}: All retries failed.`, error);
          throw new Error(`Failed to generate Chapter ${chapterIndex} after multiple retries due to rate limits. Please try again later.`);
        }
        console.warn(`Rate limit hit for chapter ${chapterIndex}. Retrying in ${backoffDelay}ms... (Attempt ${attempt}/${maxRetries})`);
        await delay(backoffDelay);
        backoffDelay *= 2; // Exponential backoff
      } else {
        // Not a rate limit error, fail immediately
        console.error(`Error generating chapter ${chapterIndex}:`, error);
        throw new Error(`Failed to generate Chapter ${chapterIndex}.`);
      }
    }
  }

  // This fallback should ideally not be reached
  throw new Error(`Failed to generate Chapter ${chapterIndex} after all retries.`);
}
