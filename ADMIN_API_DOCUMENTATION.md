# Admin API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000` (development) or your production URL  
**Authentication:** Password-based (see below)

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Admin Panel (HTML)](#admin-panel-html)
  - [Get All Characters (JSON API)](#get-all-characters-json-api)
- [Request/Response Examples](#requestresponse-examples)
- [Character Management](#character-management)
- [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

The Admin API provides access to manage and view all characters, including those hidden from the public API. This is useful for:

- Viewing all characters (including hidden ones)
- Getting shareable links for any character
- Managing character visibility
- Debugging character configurations

**Note:** The admin API is password-protected. The password is currently hardcoded as `genies` (see `src/routes/admin.ts`).

---

## Authentication

All admin endpoints require a password. The password can be provided in two ways:

1. **Query Parameter:** `?password=genies`
2. **Request Body:** `{ "password": "genies" }`

**Current Password:** `genies`

**Security Note:** In production, consider using environment variables or a more secure authentication method.

---

## Endpoints

### Admin Panel (HTML)

Get a visual admin panel with a table of all characters, including hidden ones.

**Endpoint:** `GET /admin`

**Authentication:** Required (password)

**Query Parameters:**
- `password` (string, required) - Admin password

**Response:** HTML page with:
- Statistics dashboard (total, visible, hidden characters)
- Table of all characters with:
  - Avatar
  - Name
  - Description
  - Status (Visible/Hidden)
  - Config ID
  - Shareable link (with copy button)

**Example:**
```javascript
// Open in browser or fetch HTML
const response = await fetch('http://localhost:3000/admin?password=genies');
const html = await response.text();
// Or simply navigate to: http://localhost:3000/admin?password=genies
```

**Browser Access:**
Simply navigate to: `http://localhost:3000/admin?password=genies`

---

### Get All Characters (JSON API)

Get a JSON response with all characters, including hidden ones. This is useful for programmatic access.

**Endpoint:** `GET /admin/api/characters`

**Authentication:** Required (password)

**Query Parameters:**
- `password` (string, required) - Admin password

**Response:**
```json
{
  "characters": [
    {
      "config_id": "CHAR_c12ee438-69fc-4c31-8d04-53289358fb72",
      "name": "River",
      "description": "Your favorite situationship",
      "display_order": 1,
      "avatar_url": "/images/redflag.png",
      "hidden": false
    },
    {
      "config_id": "CHAR_9017bddc-a9fb-438e-ab1a-97bc8b71bc89",
      "name": "Jay from ENHYPEN",
      "description": "Jay from ENHYPEN",
      "display_order": 10,
      "hidden": true
    }
    // ... more characters
  ],
  "total": 25,
  "visible": 13,
  "hidden": 12
}
```

**Response Fields:**
- `characters` (array) - Array of all character definitions (including hidden)
  - `config_id` (string) - Character configuration ID
  - `name` (string, optional) - Display name
  - `description` (string, optional) - Character description
  - `display_order` (number, optional) - Display order
  - `avatar_url` (string, optional) - Avatar image URL
  - `hidden` (boolean, optional) - Whether character is hidden from public API
- `total` (number) - Total number of characters
- `visible` (number) - Number of visible characters
- `hidden` (number) - Number of hidden characters

**Example:**
```javascript
const response = await fetch('http://localhost:3000/admin/api/characters?password=genies');
const data = await response.json();

console.log(`Total characters: ${data.total}`);
console.log(`Visible: ${data.visible}, Hidden: ${data.hidden}`);

// Access all characters (including hidden)
data.characters.forEach(char => {
  console.log(`${char.name} (${char.config_id}) - ${char.hidden ? 'Hidden' : 'Visible'}`);
});
```

**Error Responses:**
- If password is missing or incorrect, returns HTML login page (status 200)
- `500` - Server error

---

### Set/Update Character Password

Set or update a password for a character to password-protect chat access.

**Endpoint:** `PUT /admin/api/characters/:config_id/password`

**Full URL Format:** `/admin/api/characters/{config_id}/password?password={admin_password}`

**Authentication:** Required (admin password)

**URL Parameters:**
- `config_id` (string, required) - Character configuration ID (e.g., `CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e`)

**Query Parameters:**
- `password` (string, required) - Admin password (currently `genies`)

**Request Body:**
```json
{
  "password": "<character_password>",
  "hint": "<optional_hint>"
}
```

**Note:** The `password` field in the request body is the character password (what users will enter), NOT the admin password. The admin password goes in the query parameter.

**Response:**
```json
{
  "config_id": "CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e",
  "password_required": true,
  "updated_at": "2025-01-15T12:34:56.000Z"
}
```

**Example:**
```javascript
const configId = 'CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e';
const adminPassword = 'genies';
const characterPassword = 'mycharacterpassword';

const response = await fetch(
  `http://localhost:3000/admin/api/characters/${configId}/password?password=${adminPassword}`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: characterPassword,
      hint: 'Think of a color'
    })
  }
);

if (!response.ok) {
  const error = await response.json();
  console.error('Error:', error);
} else {
  const result = await response.json();
  console.log('Password set:', result);
}
```

**Error Responses:**
- `400` - Missing or invalid password in request body, or config_id missing
- `401` - Invalid admin password (returns HTML login page)
- `404` - Character not found
- `500` - Server error

---

### Remove Character Password

Remove password protection from a character.

**Endpoint:** `DELETE /admin/api/characters/:config_id/password`

**Full URL Format:** `/admin/api/characters/{config_id}/password?password={admin_password}`

**Authentication:** Required (admin password)

**URL Parameters:**
- `config_id` (string, required) - Character configuration ID (e.g., `CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e`)

**Query Parameters:**
- `password` (string, required) - Admin password (currently `genies`)

**Response:**
```json
{
  "config_id": "CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e",
  "password_required": false,
  "updated_at": "2025-01-15T12:34:56.000Z"
}
```

**Example:**
```javascript
const configId = 'CHAR_dbafb670-8b2b-4d58-ac81-2b2f4058f44e';
const adminPassword = 'genies';

const response = await fetch(
  `http://localhost:3000/admin/api/characters/${configId}/password?password=${adminPassword}`,
  {
    method: 'DELETE'
  }
);

if (!response.ok) {
  const error = await response.json();
  console.error('Error:', error);
} else {
  const result = await response.json();
  console.log('Password removed:', result);
}
```

**Error Responses:**
- `400` - Missing config_id
- `401` - Invalid admin password (returns HTML login page)
- `404` - Character not found
- `500` - Server error

---

## Request/Response Examples

### Fetch All Characters (Including Hidden)

```javascript
async function getAllCharacters(adminPassword = 'genies') {
  try {
    const response = await fetch(
      `http://localhost:3000/admin/api/characters?password=${adminPassword}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch characters:', error);
    throw error;
  }
}

// Usage
const adminData = await getAllCharacters();
console.log('All characters:', adminData.characters);
console.log('Hidden characters:', adminData.characters.filter(c => c.hidden));
```

### Using POST with Password in Body

```javascript
async function getAllCharactersPost(adminPassword = 'genies') {
  const response = await fetch('http://localhost:3000/admin/api/characters', {
    method: 'GET', // Still GET, but password can be in body for consistency
    headers: {
      'Content-Type': 'application/json',
    },
    // Note: Some servers may not accept body in GET requests
    // Use query parameter instead for GET requests
  });
  
  // Better approach: Use query parameter
  const response = await fetch(
    `http://localhost:3000/admin/api/characters?password=${encodeURIComponent(adminPassword)}`
  );
  
  return response.json();
}
```

### Filter Hidden Characters

```javascript
async function getHiddenCharacters() {
  const response = await fetch(
    'http://localhost:3000/admin/api/characters?password=genies'
  );
  const data = await response.json();
  
  // Filter only hidden characters
  const hiddenCharacters = data.characters.filter(char => char.hidden === true);
  
  return hiddenCharacters;
}
```

### Generate Shareable Links

```javascript
async function getCharacterShareLinks(baseUrl = 'http://localhost:3000') {
  const response = await fetch(
    'http://localhost:3000/admin/api/characters?password=genies'
  );
  const data = await response.json();
  
  // Generate shareable links for all characters
  const shareLinks = data.characters.map(char => ({
    config_id: char.config_id,
    name: char.name,
    link: `${baseUrl}?character=${char.config_id}`,
    hidden: char.hidden
  }));
  
  return shareLinks;
}
```

---

## Character Management

### How Characters Are Hidden

Characters are managed in `src/config/characters.ts`. To hide a character:

1. Open `src/config/characters.ts`
2. Find the character definition
3. Add `hidden: true` property:

```typescript
{
  config_id: 'CHAR_9017bddc-a9fb-438e-ab1a-97bc8b71bc89',
  name: 'Jay from ENHYPEN',
  description: 'Jay from ENHYPEN',
  display_order: 10,
  hidden: true,  // <-- This hides it from public API
}
```

### Public vs Admin API

- **Public API** (`GET /api/characters`): Returns only visible characters (filters out `hidden: true`)
- **Admin API** (`GET /admin/api/characters`): Returns all characters (including hidden)

### Making a Hidden Character Visible

Remove the `hidden` property or set `hidden: false`:

```typescript
{
  config_id: 'CHAR_9017bddc-a9fb-438e-ab1a-97bc8b71bc89',
  name: 'Jay from ENHYPEN',
  description: 'Jay from ENHYPEN',
  display_order: 10,
  // hidden: true,  // <-- Remove this line or set to false
}
```

**Note:** After making changes to `src/config/characters.ts`, you need to restart the server for changes to take effect.

---

## Frontend Integration Guide

### React Hook for Admin API

```tsx
import { useState, useEffect, useCallback } from 'react';

interface Character {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  avatar_url?: string;
  hidden?: boolean;
}

interface AdminCharactersResponse {
  characters: Character[];
  total: number;
  visible: number;
  hidden: number;
}

export function useAdminCharacters(adminPassword: string = 'genies') {
  const [data, setData] = useState<AdminCharactersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3000/admin/api/characters?password=${encodeURIComponent(adminPassword)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: HTTP ${response.status}`);
      }
      
      const adminData = await response.json();
      setData(adminData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters: data?.characters || [],
    total: data?.total || 0,
    visible: data?.visible || 0,
    hidden: data?.hidden || 0,
    isLoading,
    error,
    refetch: fetchCharacters,
  };
}

// Usage in component
function AdminCharacterList() {
  const { characters, total, visible, hidden, isLoading, error } = useAdminCharacters();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="stats">
        <div>Total: {total}</div>
        <div>Visible: {visible}</div>
        <div>Hidden: {hidden}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Config ID</th>
            <th>Status</th>
            <th>Share Link</th>
          </tr>
        </thead>
        <tbody>
          {characters.map(char => (
            <tr key={char.config_id}>
              <td>{char.name || 'Unnamed'}</td>
              <td><code>{char.config_id}</code></td>
              <td>
                <span className={char.hidden ? 'badge hidden' : 'badge visible'}>
                  {char.hidden ? 'Hidden' : 'Visible'}
                </span>
              </td>
              <td>
                <input
                  type="text"
                  readOnly
                  value={`http://localhost:3000?character=${char.config_id}`}
                />
                <button onClick={() => copyToClipboard(`http://localhost:3000?character=${char.config_id}`)}>
                  Copy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Vanilla JavaScript Example

```javascript
class AdminAPI {
  constructor(baseUrl, password = 'genies') {
    this.baseUrl = baseUrl;
    this.password = password;
  }

  async getAllCharacters() {
    const response = await fetch(
      `${this.baseUrl}/admin/api/characters?password=${encodeURIComponent(this.password)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async getHiddenCharacters() {
    const data = await await this.getAllCharacters();
    return data.characters.filter(char => char.hidden === true);
  }

  async getVisibleCharacters() {
    const data = await this.getAllCharacters();
    return data.characters.filter(char => !char.hidden);
  }

  generateShareLink(configId, frontendUrl) {
    return `${frontendUrl}?character=${configId}`;
  }
}

// Usage
const admin = new AdminAPI('http://localhost:3000', 'genies');

admin.getAllCharacters().then(data => {
  console.log('Total characters:', data.total);
  console.log('All characters:', data.characters);
});

admin.getHiddenCharacters().then(hidden => {
  console.log('Hidden characters:', hidden);
});
```

### TypeScript Types

```typescript
interface CharacterDefinition {
  config_id: string;
  name?: string;
  description?: string;
  display_order?: number;
  avatar_url?: string;
  hidden?: boolean;
}

interface AdminCharactersResponse {
  characters: CharacterDefinition[];
  total: number;
  visible: number;
  hidden: number;
}
```

---

## Error Handling

### Handling Authentication Errors

If the password is incorrect or missing, the API returns an HTML login page (status 200). Check the response content type:

```javascript
async function getAllCharacters(adminPassword) {
  const response = await fetch(
    `http://localhost:3000/admin/api/characters?password=${adminPassword}`
  );
  
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    // Got HTML login page instead of JSON
    throw new Error('Authentication failed - incorrect password');
  }
}
```

### Error Response Format

For JSON errors:
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

---

## Security Considerations

1. **Password Storage**: Currently hardcoded as `genies`. Consider:
   - Using environment variables: `process.env.ADMIN_PASSWORD`
   - Implementing more secure authentication (JWT, OAuth, etc.)
   - Rate limiting admin endpoints

2. **HTTPS**: Always use HTTPS in production for admin endpoints

3. **Password in URLs**: Be careful when logging URLs with passwords. Consider using POST requests with password in body for sensitive operations

4. **CORS**: Ensure CORS is properly configured if accessing from a different origin

---

## Troubleshooting

### "Got HTML instead of JSON"

**Problem:** The API returns an HTML login page instead of JSON.

**Solution:** 
- Check that the password is correct
- Ensure the password is properly URL-encoded in the query parameter
- Verify you're using the correct endpoint (`/admin/api/characters`)

### "404 Not Found"

**Problem:** Endpoint not found.

**Solution:**
- Verify the base URL is correct
- Check that the admin routes are properly mounted (should be at `/admin`)
- Ensure the server is running

### "CORS Error"

**Problem:** Browser blocks the request due to CORS.

**Solution:**
- The server has CORS enabled by default
- If issues persist, check server CORS configuration
- For development, ensure you're using the correct origin

---

## API Comparison

| Feature | Public API | Admin API |
|---------|-----------|-----------|
| Endpoint | `/api/characters` | `/admin/api/characters` |
| Authentication | None | Password required |
| Hidden Characters | ❌ Filtered out | ✅ Included |
| Response Format | JSON | JSON |
| Use Case | Frontend character list | Admin management |

---

## Changelog

### Version 1.0.0
- Initial admin API release
- HTML admin panel
- JSON API endpoint for all characters
- Password-based authentication

---

**Last Updated:** January 2025  
**API Version:** 1.0.0

