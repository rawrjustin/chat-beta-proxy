/**
 * Strip tags in curly brackets from text
 * Removes patterns like {E: Confident(3)} or {G: Nod slowly}
 * @param text - The text to clean
 * @returns The text with all curly bracket tags removed
 */
export function stripCurlyBracketTags(text: string | undefined | null): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove all content within curly brackets, including the brackets themselves
  // This regex matches { followed by any content (including nested braces) until the matching }
  return text.replace(/\{[^}]*\}/g, '').trim();
}

