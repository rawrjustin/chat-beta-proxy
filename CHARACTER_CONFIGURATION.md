# Character Configuration Guide

## Overview

The backend defines which characters are available to the frontend. The frontend only needs to call `GET /api/characters` to see what characters are available.

## Configuration Methods

### Method 1: Hardcoded Configuration (Recommended)

Edit `src/config/characters.ts` to define available characters:

```typescript
export const AVAILABLE_CHARACTERS: CharacterDefinition[] = [
  {
    config_id: 'CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4',
    name: 'Woody',
    description: 'Sheriff Woody Pride',
    display_order: 1,
  },
  {
    config_id: 'CHAR_another-character-id',
    name: 'Character Name',
    description: 'Character description',
    display_order: 2,
  },
];
```

**Advantages:**
- Version controlled
- Can include metadata (name, description, display_order)
- Easy to review and maintain

### Method 2: Environment Variable

Set `AVAILABLE_CHARACTERS` environment variable with comma-separated character IDs:

```bash
AVAILABLE_CHARACTERS=CHAR_id1,CHAR_id2,CHAR_id3
```

**Advantages:**
- Quick to change without code deployment
- Good for dynamic environments

**Limitations:**
- No metadata (name, description, etc.)
- Display order is based on array index

## API Endpoint

### GET /api/characters

Returns all available characters with their full configurations.

**Response:**
```json
{
  "characters": [
    {
      "config_id": "CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4",
      "name": "Woody",
      "description": "Sheriff Woody Pride",
      "display_order": 1,
      "config": {
        // Full character configuration from API
      }
    }
  ],
  "total": 1
}
```

## Frontend Usage

The frontend should:

1. **Call `GET /api/characters`** on app load or when needed
2. **Display the characters** to users
3. **Use the `config_id`** from the response when starting chats

**Example:**
```javascript
// Fetch available characters
const response = await fetch('http://localhost:3000/api/characters');
const { characters } = await response.json();

// Display to users
characters.forEach(character => {
  console.log(`${character.name}: ${character.config_id}`);
  // Use character.config_id to start chats
});
```

## Adding New Characters

1. **Get the character config ID** (e.g., `CHAR_6c606003-8b02-4943-8690-73b9b8fe3ae4`)
2. **Add to `src/config/characters.ts`**:
   ```typescript
   {
     config_id: 'CHAR_new-character-id',
     name: 'Character Name',
     description: 'Character description',
     display_order: 3,
   }
   ```
3. **Rebuild and redeploy** the backend
4. **Frontend automatically gets the new character** via `GET /api/characters`

## Removing Characters

Simply remove the character from `AVAILABLE_CHARACTERS` array in `src/config/characters.ts`. The frontend will no longer see it when calling `GET /api/characters`.

## Display Order

Characters are automatically sorted by `display_order` (ascending). Characters without a `display_order` will appear last.

## Notes

- Characters are fetched from the API in parallel for performance
- If a character config fails to load, it will be omitted from the response (not cause an error)
- The backend caches nothing - each request fetches fresh configs
- Frontend can cache the character list if desired

