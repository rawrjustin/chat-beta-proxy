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
    name: 'River',
    description: 'Your favorite situationship',
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
  {
    config_id: 'CHAR_f8b803dc-e502-4204-a11a-a7aac5ab05b2',
    name: 'Delusional Sleepy Overmedicated Girl',
    description: 'Delusional Sleepy Overmedicated Girl',
    display_order: 5,
    avatar_url: '/images/delusional.png',
  },
  {
    config_id: 'CHAR_05d7f0a4-d3e3-4a91-bbc6-b565a6492bba',
    name: 'Gaslighting Ex',
    description: 'Gaslighting Ex',
    display_order: 6,
    avatar_url: '/images/gaslight ex.png',
  },
  {
    config_id: 'CHAR_e5be91f5-dee3-4130-81dc-b0d2397e201d',
    name: 'Big Brother',
    description: 'Big Brother',
    display_order: 7,
    avatar_url: '/images/bigbro.png',
  },
  {
    config_id: 'CHAR_20b996c7-642d-48e4-8f10-37eef3ce457b',
    name: 'Yoga Wine Mom',
    description: 'Yoga Wine Mom',
    display_order: 8,
    avatar_url: '/images/yoga.png',
  },
  {
    config_id: 'CHAR_d7e47bb8-cdf5-4bca-b0b0-eb518a40e79b',
    name: 'Pythagoras',
    description: 'Pythagoras',
    display_order: 9,
  },
  {
    config_id: 'CHAR_9017bddc-a9fb-438e-ab1a-97bc8b71bc89',
    name: 'Jay from ENHYPEN',
    description: 'Jay from ENHYPEN',
    display_order: 10,
  },
  {
    config_id: 'CHAR_94dff88c-8ea5-400f-96ad-6b4cfe62025a',
    name: 'Nightwing',
    description: 'Nightwing',
    display_order: 11,
  },
  {
    config_id: 'CHAR_4ea65277-124d-4949-8e7e-f2b4cb54061a',
    name: 'Ghost from COD',
    description: 'Ghost from COD',
    display_order: 12,
  },
  {
    config_id: 'CHAR_6b42c735-3294-4e28-b5cf-75306f2413f1',
    name: 'Johnny Silverhand',
    description: 'Johnny Silverhand',
    display_order: 13,
  },
  {
    config_id: 'CHAR_2f1adabf-41ef-48cc-a733-72df367b74da',
    name: 'Robin',
    description: 'Robin',
    display_order: 14,
  },
  {
    config_id: 'CHAR_27949767-0af6-4312-aed0-9cef5ddbdeb3',
    name: 'Yunjin (LE SSERAFIM)',
    description: 'Yunjin (LE SSERAFIM)',
    display_order: 15,
  },
  {
    config_id: 'CHAR_91d73179-f1d5-4163-bfca-3185ebee7594',
    name: 'Deku',
    description: 'Deku',
    display_order: 16,
  },
  {
    config_id: 'CHAR_625009f6-5c79-4ccb-9a2f-80d622367474',
    name: 'Freddy FNAF',
    description: 'Freddy FNAF',
    display_order: 17,
  },
  {
    config_id: 'CHAR_7914ca60-6213-4f10-9d3f-9b585d156932',
    name: 'Shawn Mendes',
    description: 'Shawn Mendes',
    display_order: 18,
  },
  {
    config_id: 'CHAR_115ca055-9c2b-4b9a-8be8-2b9b94246bee',
    name: 'Jake Paul',
    description: 'Jake Paul',
    display_order: 19,
  },
  {
    config_id: 'CHAR_ca53bee4-a10a-420f-91d1-f693ae46cfb7',
    name: 'Roronoa Zoro',
    description: 'Zoro from One Piece',
    display_order: 20,
  },
  {
    config_id: 'CHAR_33b6efd3-40ef-4dd1-a319-42a8515b5a8e',
    name: 'Aggretsuko',
    description: 'Learn to Rage with Aggretsuko',
    display_order: 21,
    avatar_url: '/images/aggretsuko.jpg',
  },
  {
    config_id: 'CHAR_ba16c199-be27-490a-ab05-6380d877c102',
    name: 'Fay',
    description: 'Spacy genius girl next door',
    display_order: 22,
  },
  {
    config_id: 'CHAR_3602dd3e-4e25-4e54-b25d-ce6ec7741bb9',
    name: 'Theo',
    description: 'Sarcastic, "always right" boyfriend',
    display_order: 23,
  },
  {
    config_id: 'CHAR_0da620b1-c832-4fea-8a9a-eb6c15f111aa',
    name: 'Blunt Headstrong',
    description: 'Unlicensed Life Coach',
    display_order: 24,
  },
  {
    config_id: 'CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e',
    name: 'Dogma: Mama didn't raise no b',
    description: 'Dogma: Mama didn't raise no b',
    display_order: 25,
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
 * Returns a stable, immutable array of character definitions
 * Character IDs are guaranteed to remain consistent across deployments and refreshes
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
  // Return a copy to ensure immutability and prevent accidental modifications
  return [...AVAILABLE_CHARACTERS];
}

