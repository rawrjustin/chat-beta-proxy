/**
 * Available Characters Configuration
 * 
 * This file defines which characters are available to the frontend.
 * Add or remove character IDs here to control what's available.
 */

export interface CharacterDefinition {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  // Add any other metadata you want to expose to frontend
}

// Define available characters here
// These will be exposed to the frontend via GET /api/characters
export const AVAILABLE_CHARACTERS: CharacterDefinition[] = [
  {
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    name: 'Woody',
    description: 'Sheriff Woody Pride',
    display_order: 1,
  },
  // Add more characters here as needed
  // {
  //   config_id: 'CHAR_another-character-id',
  //   name: 'Character Name',
  //   description: 'Character description',
  //   display_order: 2,
  // },
];

/**
 * Get available character IDs from environment variable (comma-separated)
 * Falls back to the hardcoded list above
 */
export function getAvailableCharacterIds(): string[] {
  const envCharacters = process.env.AVAILABLE_CHARACTERS;
  
  if (envCharacters) {
    // Parse comma-separated list from environment
    return envCharacters
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
  }
  
  // Fall back to hardcoded list
  return AVAILABLE_CHARACTERS.map(char => char.config_id);
}

/**
 * Get character definitions (with metadata)
 */
export function getAvailableCharacters(): CharacterDefinition[] {
  const envCharacters = process.env.AVAILABLE_CHARACTERS;
  
  if (envCharacters) {
    // If using env var, create minimal definitions
    return getAvailableCharacterIds().map((config_id, index) => ({
      config_id,
      display_order: index + 1,
    }));
  }
  
  // Return hardcoded definitions with metadata
  return AVAILABLE_CHARACTERS;
}

