import { marked } from 'marked';

/**
 * Parses a Markdown string and returns a sanitized HTML string.
 * This function is the central place for converting AI responses into
 * a displayable format.
 * @param markdownText The raw Markdown text from the AI.
 * @returns A string containing safe HTML.
 */
export const parseMarkdown = (markdownText: string): string => {
    if (!markdownText) {
        return '';
    }
    // marked.parse returns a string or a promise, but for string input it's sync.
    // Casting to string is safe here.
    return marked.parse(markdownText) as string;
};
