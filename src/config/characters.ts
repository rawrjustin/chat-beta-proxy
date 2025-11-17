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
  hidden?: boolean; // If true, character is hidden from public API but visible in admin
  // Add any other metadata you want to expose to frontend
}

/**
 * Get S3 URL for a character image
 * Uses S3_BUCKET_BASE_URL environment variable if set, otherwise constructs from bucket name
 * Format: https://{bucket-name}.s3.{region}.amazonaws.com/{filename}
 * Or: https://{cloudfront-domain}/{filename} if using CloudFront
 */
function getS3ImageUrl(filename: string): string {
  const baseUrl = process.env.S3_BUCKET_BASE_URL;
  
  if (baseUrl) {
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    return `${cleanBaseUrl}/${filename}`;
  }
  
  // Default to public S3 URL format
  // You can customize the region if needed (defaults to us-west-2 for Oregon)
  const bucketName = process.env.S3_BUCKET_NAME || 'genies-character-profile-images-dev';
  const region = process.env.AWS_REGION || 'us-west-2';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${filename}`;
}

// Define available characters here
// These will be exposed to the frontend via GET /api/characters
export const AVAILABLE_CHARACTERS: CharacterDefinition[] = [
  {
    config_id: 'CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e',
    name: 'Dogma',
    description: 'Mama ain\'t raise no b',
    display_order: 1,
    avatar_url: getS3ImageUrl('dogma.png'),
  },
  {
    config_id: 'CHAR_c12ee438-69fc-4c31-8d04-53289358fb72',
    name: 'River',
    description: 'Your favorite situationship',
    display_order: 2,
    avatar_url: getS3ImageUrl('redflag.png'),
  },
  {
    config_id: 'CHAR_7fc3c18a-cdfa-42f3-90f0-443cd013c5e0',
    name: 'Jesus',
    description: 'guys stop doordashing me water',
    display_order: 3,
    avatar_url: getS3ImageUrl('jesus.png'),
  },
  {
    config_id: 'CHAR_d970937b-a512-4e23-9171-618e0db785b1',
    name: 'Bad Santa',
    description: 'Bad Santa',
    display_order: 4,
    avatar_url: getS3ImageUrl('bad-santa.png'),
  },
  {
    config_id: 'CHAR_f0358157-1882-4856-b501-def240a44a06',
    name: 'Mafia Dad',
    description: 'Mafia Dad',
    display_order: 5,
    avatar_url: getS3ImageUrl('mafia-dad.png'),
  },
  {
    config_id: 'CHAR_f8b803dc-e502-4204-a11a-a7aac5ab05b2',
    name: 'Delusional Sleepy Overmedicated Girl',
    description: 'Delusional Sleepy Overmedicated Girl',
    display_order: 6,
    avatar_url: getS3ImageUrl('delusional.png'),
  },
  {
    config_id: 'CHAR_05d7f0a4-d3e3-4a91-bbc6-b565a6492bba',
    name: 'Gaslighting Ex',
    description: 'Gaslighting Ex',
    display_order: 7,
    avatar_url: getS3ImageUrl('gaslight ex.png'),
  },
  {
    config_id: 'CHAR_e5be91f5-dee3-4130-81dc-b0d2397e201d',
    name: 'Big Brother',
    description: 'Big Brother',
    display_order: 8,
    avatar_url: getS3ImageUrl('bigbro.png'),
  },
  {
    config_id: 'CHAR_20b996c7-642d-48e4-8f10-37eef3ce457b',
    name: 'Yoga Wine Mom',
    description: 'Yoga Wine Mom',
    display_order: 9,
    avatar_url: getS3ImageUrl('yoga.png'),
  },
  {
    config_id: 'CHAR_d7e47bb8-cdf5-4bca-b0b0-eb518a40e79b',
    name: 'Pythagoras',
    description: 'Acute guy with obtuse humor',
    display_order: 10,
    avatar_url: getS3ImageUrl('pyth.png'),
  },
  {
    config_id: 'CHAR_9017bddc-a9fb-438e-ab1a-97bc8b71bc89',
    name: 'Jay from ENHYPEN',
    description: 'Jay from ENHYPEN',
    display_order: 11,
    hidden: true,
  },
  {
    config_id: 'CHAR_94dff88c-8ea5-400f-96ad-6b4cfe62025a',
    name: 'Nightwing',
    description: 'Nightwing',
    display_order: 12,
    hidden: true,
  },
  {
    config_id: 'CHAR_4ea65277-124d-4949-8e7e-f2b4cb54061a',
    name: 'Ghost from COD',
    description: 'Ghost from COD',
    display_order: 13,
    hidden: true,
  },
  {
    config_id: 'CHAR_6b42c735-3294-4e28-b5cf-75306f2413f1',
    name: 'Johnny Silverhand',
    description: 'Johnny Silverhand',
    display_order: 14,
    hidden: true,
  },
  {
    config_id: 'CHAR_2f1adabf-41ef-48cc-a733-72df367b74da',
    name: 'Robin',
    description: 'Robin',
    display_order: 15,
    hidden: true,
  },
  {
    config_id: 'CHAR_27949767-0af6-4312-aed0-9cef5ddbdeb3',
    name: 'Yunjin (LE SSERAFIM)',
    description: 'Yunjin (LE SSERAFIM)',
    display_order: 16,
    hidden: true,
  },
  {
    config_id: 'CHAR_91d73179-f1d5-4163-bfca-3185ebee7594',
    name: 'Deku',
    description: 'Sweet, shy, and aiming to be your No.1 hero.',
    display_order: 17,
    hidden: true,
  },
  {
    config_id: 'CHAR_625009f6-5c79-4ccb-9a2f-80d622367474',
    name: 'Freddy FNAF',
    description: 'Freddy FNAF',
    display_order: 18,
    hidden: true,
  },
  {
    config_id: 'CHAR_7914ca60-6213-4f10-9d3f-9b585d156932',
    name: 'Shawn Mendes',
    description: 'Shawn Mendes',
    display_order: 19,
    hidden: true,
  },
  {
    config_id: 'CHAR_115ca055-9c2b-4b9a-8be8-2b9b94246bee',
    name: 'Jake Paul',
    description: 'Jake Paul',
    display_order: 20,
    hidden: true,
  },
  {
    config_id: 'CHAR_ca53bee4-a10a-420f-91d1-f693ae46cfb7',
    name: 'Roronoa Zoro',
    description: 'Zoro from One Piece',
    display_order: 21,
    hidden: true,
  },
  {
    config_id: 'CHAR_33b6efd3-40ef-4dd1-a319-42a8515b5a8e',
    name: 'Aggretsuko',
    description: 'Learn to Rage with Aggretsuko',
    display_order: 22,
    avatar_url: getS3ImageUrl('aggretsuko.jpg'),
    hidden: true,
  },
  {
    config_id: 'CHAR_ba16c199-be27-490a-ab05-6380d877c102',
    name: 'Fay',
    description: 'Spacy genius girl next door',
    display_order: 23,
    avatar_url: getS3ImageUrl('fay.png'),
  },
  {
    config_id: 'CHAR_3602dd3e-4e25-4e54-b25d-ce6ec7741bb9',
    name: 'Theo',
    description: 'Sarcastic, "always right" boyfriend',
    display_order: 24,
    avatar_url: getS3ImageUrl('theo.png'),
  },
  {
    config_id: 'CHAR_0da620b1-c832-4fea-8a9a-eb6c15f111aa',
    name: 'Blunt Headstrong',
    description: 'Unlicensed Life Coach',
    display_order: 25,
    avatar_url: getS3ImageUrl('blunt.png'),
  },
  {
    config_id: 'CHAR_b4bca3ed-18dc-4561-a511-636a5120e07e',
    name: 'Shawn Mendes',
    description: 'Co-creating in his home studio',
    display_order: 26,
    hidden: true,
  },
  {
    config_id: 'CHAR_98403003-e954-4689-95be-25eaddbedc3a',
    name: 'ProtoGPT',
    description: 'Dad threw me out after he made ChatGPT',
    display_order: 27,
  },
  {
    config_id: 'CHAR_cf7ce336-ade3-48f5-9448-e8c57bad9502',
    name: 'Duchess',
    description: 'Your Newly Talking, Sassy, Flamboyant Boss Dog',
    display_order: 28,
  },
  {
    config_id: 'CHAR_02e95079-514a-4e08-9c3a-ba43cbce956b',
    name: 'Khyriel',
    description: 'Runaway Fae Learning Human Culture',
    display_order: 29,
  },
  {
    config_id: 'CHAR_f967c2ef-12c4-4297-9dc0-126ae14245b7',
    name: 'Oneiro',
    description: 'Dream-Tarot Interpreter',
    display_order: 30,
  },
  {
    config_id: 'CHAR_dce74e78-ef06-484d-abb2-057962713494',
    name: 'Sir Edric',
    description: 'Chivalrous Tech Knight',
    display_order: 31,
  },
  {
    config_id: 'CHAR_ff5c82ff-8f47-4509-a990-69fa5d84163c',
    name: 'Crunch Thompson',
    description: 'Disney Channel–Style High School Bully',
    display_order: 32,
  },
  {
    config_id: 'CHAR_d58b7a44-d1e1-4f17-ba74-72cd95d5f399',
    name: 'Serena Moonflower',
    description: 'Your Woo-Woo Friend',
    display_order: 33,
  },
  {
    config_id: 'CHAR_23da58ba-b583-4a00-b086-1a4cc2c66a52',
    name: 'Marv Wentworth',
    description: 'Corporate Translator, Fired Ex–Chief of Staff',
    display_order: 34,
  },
  {
    config_id: 'CHAR_6007257e-ca22-47f9-823c-1037f48e1afb',
    name: 'Baronesss Vesper',
    description: 'Her Royal Kittiness',
    display_order: 35,
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
 * Filters out hidden characters for public API
 */
export function getAvailableCharacters(includeHidden: boolean = false): CharacterDefinition[] {
  const envCharacters = process.env.AVAILABLE_CHARACTERS;
  
  if (envCharacters) {
    // If using env var, create minimal definitions
    const characters = getAvailableCharacterIds().map((config_id, index) => ({
      config_id,
      display_order: index + 1,
    }));
    
    // Filter hidden characters if not including them
    if (!includeHidden) {
      return characters.filter(char => {
        const fullChar = AVAILABLE_CHARACTERS.find(c => c.config_id === char.config_id);
        return !fullChar?.hidden;
      });
    }
    
    return characters;
  }
  
  // Return hardcoded definitions with metadata
  // Return a copy to ensure immutability and prevent accidental modifications
  const allCharacters = [...AVAILABLE_CHARACTERS];
  
  // Filter hidden characters if not including them
  if (!includeHidden) {
    const filtered = allCharacters.filter(char => !char.hidden);
    const hiddenCount = allCharacters.length - filtered.length;
    if (hiddenCount > 0) {
      console.log(`[getAvailableCharacters] Filtered out ${hiddenCount} hidden character(s)`);
    }
    return filtered;
  }
  
  return allCharacters;
}

/**
 * Get all character definitions including hidden ones (for admin use)
 */
export function getAllCharacters(): CharacterDefinition[] {
  return getAvailableCharacters(true);
}

