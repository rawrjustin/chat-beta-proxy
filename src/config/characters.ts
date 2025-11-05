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
  avatar_url?: string;
  // Add any other metadata you want to expose to frontend
}

// Define available characters here
// These will be exposed to the frontend via GET /api/characters
export const AVAILABLE_CHARACTERS: CharacterDefinition[] = [
  {
    config_id: 'CHAR_c12ee438-69fc-4c31-8d04-53289358fb72',
    name: 'Tyler, the Walking Red Flag',
    description: 'Tyler, the Walking Red Flag',
    display_order: 1,
    avatar_url: '/images/redflag.png',
  },
  {
    config_id: 'CHAR_7fc3c18a-cdfa-42f3-90f0-443cd013c5e0',
    name: 'Jesus',
    description: 'Jesus',
    display_order: 2,
    avatar_url: '/images/jesus.png',
  },
  {
    config_id: 'CHAR_d970937b-a512-4e23-9171-618e0db785b1',
    name: 'Bad Santa',
    description: 'Bad Santa',
    display_order: 3,
    avatar_url: '/images/bad-santa.png',
  },
  {
    config_id: 'CHAR_f0358157-1882-4856-b501-def240a44a06',
    name: 'Mafia Dad',
    description: 'Mafia Dad',
    display_order: 4,
    avatar_url: '/images/mafia-dad.png',
  },
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

