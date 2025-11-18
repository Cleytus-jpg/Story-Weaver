import { jsPDF } from 'jspdf';
import { StoryData } from '../types';

/**
 * Formats the entire story into a single string for text export.
 */
const formatStoryForTxt = (premise: string, storyData: StoryData, chapters: string[]): string => {
    let content = `AI Story Weaver\n================\n\n`;
    content += `Premise:\n--------\n${premise}\n\n`;
    content += `Character Arcs:\n---------------\n${storyData.characterArcs}\n\n`;
    content += `Outline:\n--------\n`;
    storyData.outline.forEach((item, index) => {
        content += `${index + 1}. ${item}\n`;
    });
    content += `\n================\n\n`;

    chapters.forEach((chapterContent, index) => {
        content += `Chapter ${index + 1}\n----------------\n\n${chapterContent}\n\n\n`;
    });

    return content;
};

/**
 * Triggers a browser download for the story as a .txt file.
 */
export const exportAsTxt = (premise: string, storyData: StoryData, chapters: string[]): void => {
    const fullStory = formatStoryForTxt(premise, storyData, chapters);
    const blob = new Blob([fullStory], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'story.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


/**
 * Generates and triggers a download for the story as a .pdf file.
 */
export const exportAsPdf = (premise: string, storyData: StoryData, chapters: string[]): void => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let y = margin;

    const addWrappedText = (text: string, size: number, style: 'normal' | 'bold' | 'italic', isTitle = false) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);

        lines.forEach((line: string) => {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += size * 0.5; // Adjust line height based on font size
        });
        y += isTitle ? 8 : 4; // Add spacing after the block of text
    };

    // --- Content Generation ---

    // Title Page
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Story Weaver', pageWidth / 2, 40, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text('Your AI-Generated Story', pageWidth / 2, 52, { align: 'center' });
    
    doc.addPage();
    y = margin;
    
    // Premise
    addWrappedText('Premise', 16, 'bold', true);
    addWrappedText(premise, 12, 'normal');

    // Character Arcs
    addWrappedText('Character Arcs', 16, 'bold', true);
    addWrappedText(storyData.characterArcs, 12, 'normal');
    
    // Outline
    addWrappedText('Outline', 16, 'bold', true);
    const outlineText = storyData.outline.map((item, index) => `${index + 1}. ${item}`).join('\n');
    addWrappedText(outlineText, 12, 'normal');
    
    // Chapters
    chapters.forEach((chapterContent, index) => {
        doc.addPage();
        y = margin;
        addWrappedText(`Chapter ${index + 1}`, 18, 'bold', true);
        addWrappedText(chapterContent, 12, 'normal');
    });

    doc.save('story.pdf');
};
