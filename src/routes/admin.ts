import { Router, Request, Response } from 'express';
import { getAllCharacters, getCharacterById, characterExists } from '../config/characters';
import { getPasswordService } from '../services/passwordService';

const router = Router();
const ADMIN_PASSWORD = 'genies';

// Log route registration on module load
console.log('[Admin Routes] Registering password management endpoints:');
console.log('  PUT    /admin/api/characters/:config_id/password');
console.log('  DELETE /admin/api/characters/:config_id/password');

// Simple password check middleware
// NOTE: For PUT/DELETE requests, the body contains the character password,
// so we MUST check query parameter first for admin authentication
const checkPassword = (req: Request, res: Response, next: Function) => {
  // Always check query parameter first for admin password (required for PUT/DELETE)
  // Fall back to body.password only for backward compatibility with GET requests
  // For PUT/DELETE, req.body.password is the character password, not the admin password!
  let queryPassword: string | undefined;
  if (typeof req.query.password === 'string') {
    queryPassword = req.query.password;
  } else if (Array.isArray(req.query.password) && req.query.password.length > 0) {
    queryPassword = String(req.query.password[0]);
  }
  const bodyPassword = req.method === 'GET' ? req.body.password : undefined;
  const password = queryPassword || bodyPassword;
  
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    // Show login page if password is incorrect or missing
    const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .login-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      max-width: 400px;
      width: 100%;
    }
    
    .login-container h1 {
      text-align: center;
      margin-bottom: 10px;
      color: #333;
    }
    
    .login-container p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.9rem;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
      display: ${req.query.password ? 'block' : 'none'};
    }
    
    .error.hidden {
      display: none;
    }
    
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .submit-btn:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>🔐 Admin Login</h1>
    <p>Enter password to access admin panel</p>
    <form method="GET" action="/admin">
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required autofocus>
        <div class="error ${req.query.password ? '' : 'hidden'}">Invalid password. Please try again.</div>
      </div>
      <button type="submit" class="submit-btn">Login</button>
    </form>
  </div>
</body>
</html>
    `;
    res.send(loginHtml);
  }
};

// Admin page - serve HTML
router.get('/', checkPassword, async (req: Request, res: Response) => {
  const allCharacters = await getAllCharacters();
  
  // Generate shareable links (assuming the frontend URL structure)
  // You may need to adjust this based on your actual frontend URL structure
  const baseUrl = req.protocol + '://' + req.get('host');
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Character Management</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    .header p {
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-card h3 {
      font-size: 2rem;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    .stat-card p {
      color: #666;
      font-size: 0.9rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    thead {
      background: #f8f9fa;
    }
    
    th, td {
      padding: 15px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    
    th {
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }
    
    td {
      color: #555;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge.hidden {
      background: #ffc107;
      color: #000;
    }
    
    .badge.visible {
      background: #28a745;
      color: white;
    }
    
    .link-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .link-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: 'Monaco', 'Courier New', monospace;
    }
    
    .copy-btn {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .copy-btn:hover {
      background: #5568d3;
      transform: translateY(-1px);
    }
    
    .copy-btn:active {
      transform: translateY(0);
    }
    
    .copy-btn.copied {
      background: #28a745;
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      background: #e0e0e0;
    }
    
    .no-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Admin Panel</h1>
      <p>Character Management & Link Sharing</p>
    </div>
    
    <div class="content">
      <div class="stats">
        <div class="stat-card">
          <h3>${allCharacters.length}</h3>
          <p>Total Characters</p>
        </div>
        <div class="stat-card">
          <h3>${allCharacters.filter(c => !c.hidden).length}</h3>
          <p>Visible Characters</p>
        </div>
        <div class="stat-card">
          <h3>${allCharacters.filter(c => c.hidden).length}</h3>
          <p>Hidden Characters</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Config ID</th>
            <th>Share Link</th>
          </tr>
        </thead>
        <tbody>
          ${allCharacters
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map(
              (char, index) => `
            <tr>
              <td>
                ${
                  char.avatar_url
                    ? `<img src="${char.avatar_url}" alt="${char.name}" class="avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="no-avatar" style="display: none;">${(char.name || '?')[0]}</div>`
                    : `<div class="no-avatar">${(char.name || '?')[0]}</div>`
                }
              </td>
              <td><strong>${char.name || 'Unnamed'}</strong></td>
              <td>${char.description || '-'}</td>
              <td>
                <span class="badge ${char.hidden ? 'hidden' : 'visible'}">
                  ${char.hidden ? 'Hidden' : 'Visible'}
                </span>
              </td>
              <td><code style="font-size: 0.8rem;">${char.config_id}</code></td>
              <td>
                <div class="link-cell">
                  <input 
                    type="text" 
                    class="link-input" 
                    value="${baseUrl}?character=${char.config_id}" 
                    readonly 
                    id="link-${index}"
                  />
                  <button 
                    class="copy-btn" 
                    onclick="copyLink(${index})"
                    id="btn-${index}"
                  >
                    Copy
                  </button>
                </div>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <script>
    function copyLink(index) {
      const input = document.getElementById('link-' + index);
      const btn = document.getElementById('btn-' + index);
      
      input.select();
      input.setSelectionRange(0, 99999); // For mobile devices
      
      try {
        document.execCommand('copy');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(input.value).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    }
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

// PUT /admin/api/characters/:config_id/password - Set or update password
// NOTE: This route must be defined BEFORE the GET /api/characters route to avoid conflicts
router.put('/api/characters/:config_id/password', checkPassword, async (req: Request, res: Response) => {
  try {
    console.log(`[PUT /admin/api/characters/:config_id/password] Request received for config_id: ${req.params.config_id}`);
    const { config_id } = req.params;
    const { password, hint } = req.body;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'password is required and cannot be empty' });
    }

    // Check if character exists
    if (!(await characterExists(config_id))) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const passwordService = getPasswordService();
    await passwordService.setPassword(config_id, password, hint);

    const metadata = await passwordService.getPasswordMetadata(config_id);

    res.json({
      config_id,
      password_required: metadata.password_required,
      updated_at: metadata.password_updated_at,
    });
  } catch (error: any) {
    console.error('Error setting password:', error);
    res.status(500).json({
      error: 'Failed to set password',
      message: error.message
    });
  }
});

// DELETE /admin/api/characters/:config_id/password - Remove password
// NOTE: This route must be defined BEFORE the GET /api/characters route to avoid conflicts
router.delete('/api/characters/:config_id/password', checkPassword, async (req: Request, res: Response) => {
  try {
    console.log(`[DELETE /admin/api/characters/:config_id/password] Request received for config_id: ${req.params.config_id}`);
    const { config_id } = req.params;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    // Check if character exists
    if (!(await characterExists(config_id))) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const passwordService = getPasswordService();
    await passwordService.removePassword(config_id);

    res.json({
      config_id,
      password_required: false,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error removing password:', error);
    res.status(500).json({
      error: 'Failed to remove password',
      message: error.message
    });
  }
});

// POST /admin/api/characters - Add a new character
router.post('/api/characters', checkPassword, async (req: Request, res: Response) => {
  try {
    console.log('[POST /admin/api/characters] Request received');
    const { config_id, name, description, display_order, avatar_url, hidden } = req.body;

    // Validation
    if (!config_id || typeof config_id !== 'string' || config_id.trim().length === 0) {
      return res.status(400).json({ error: 'config_id is required and must be a non-empty string' });
    }

    // Check if character already exists
    if (await characterExists(config_id)) {
      return res.status(409).json({ error: 'Character with this config_id already exists' });
    }

    // Validate optional fields
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'name must be a string' });
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'description must be a string' });
    }
    if (display_order !== undefined && (typeof display_order !== 'number' || !Number.isInteger(display_order))) {
      return res.status(400).json({ error: 'display_order must be an integer' });
    }
    if (avatar_url !== undefined && typeof avatar_url !== 'string') {
      return res.status(400).json({ error: 'avatar_url must be a string' });
    }
    if (hidden !== undefined && typeof hidden !== 'boolean') {
      return res.status(400).json({ error: 'hidden must be a boolean' });
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'DATABASE_URL environment variable is required to add characters dynamically'
      });
    }

    // Insert character into database
    const { upsertCharacter } = await import('../services/database');
    const character = await upsertCharacter({
      config_id: config_id.trim(),
      name: name?.trim() || undefined,
      description: description?.trim() || undefined,
      display_order: display_order || undefined,
      avatar_url: avatar_url?.trim() || undefined,
      hidden: hidden || false,
    });

    console.log(`[POST /admin/api/characters] Character created: ${character.config_id}`);

    res.status(201).json({
      message: 'Character created successfully',
      character: {
        config_id: character.config_id,
        name: character.name || null,
        description: character.description || null,
        display_order: character.display_order || null,
        avatar_url: character.avatar_url || null,
        hidden: character.hidden || false,
        created_at: character.created_at,
        updated_at: character.updated_at,
      },
    });
  } catch (error: any) {
    console.error('[POST /admin/api/characters] Error creating character:', error);
    res.status(500).json({
      error: 'Failed to create character',
      message: error.message
    });
  }
});

// PUT /admin/api/characters/:config_id - Update an existing character
router.put('/api/characters/:config_id', checkPassword, async (req: Request, res: Response) => {
  try {
    console.log(`[PUT /admin/api/characters/:config_id] Request received for config_id: ${req.params.config_id}`);
    const { config_id } = req.params;
    const { name, description, display_order, avatar_url, hidden } = req.body;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    // Check if character exists
    if (!(await characterExists(config_id))) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Validate optional fields
    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ error: 'name must be a string' });
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'description must be a string' });
    }
    if (display_order !== undefined && (typeof display_order !== 'number' || !Number.isInteger(display_order))) {
      return res.status(400).json({ error: 'display_order must be an integer' });
    }
    if (avatar_url !== undefined && typeof avatar_url !== 'string') {
      return res.status(400).json({ error: 'avatar_url must be a string' });
    }
    if (hidden !== undefined && typeof hidden !== 'boolean') {
      return res.status(400).json({ error: 'hidden must be a boolean' });
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'DATABASE_URL environment variable is required to update characters dynamically'
      });
    }

    // Get existing character to preserve fields not being updated
    const { getCharacterFromDatabase } = await import('../services/database');
    const existing = await getCharacterFromDatabase(config_id);
    
    // Update character in database (upsert will update if exists)
    const { upsertCharacter } = await import('../services/database');
    const character = await upsertCharacter({
      config_id: config_id.trim(),
      name: name !== undefined ? name.trim() : existing?.name,
      description: description !== undefined ? description.trim() : existing?.description,
      display_order: display_order !== undefined ? display_order : existing?.display_order,
      avatar_url: avatar_url !== undefined ? avatar_url.trim() : existing?.avatar_url,
      hidden: hidden !== undefined ? hidden : existing?.hidden,
    });

    console.log(`[PUT /admin/api/characters/:config_id] Character updated: ${character.config_id}`);

    res.json({
      message: 'Character updated successfully',
      character: {
        config_id: character.config_id,
        name: character.name || null,
        description: character.description || null,
        display_order: character.display_order || null,
        avatar_url: character.avatar_url || null,
        hidden: character.hidden || false,
        created_at: character.created_at,
        updated_at: character.updated_at,
      },
    });
  } catch (error: any) {
    console.error('[PUT /admin/api/characters/:config_id] Error updating character:', error);
    res.status(500).json({
      error: 'Failed to update character',
      message: error.message
    });
  }
});

// DELETE /admin/api/characters/:config_id - Delete a character
router.delete('/api/characters/:config_id', checkPassword, async (req: Request, res: Response) => {
  try {
    console.log(`[DELETE /admin/api/characters/:config_id] Request received for config_id: ${req.params.config_id}`);
    const { config_id } = req.params;

    if (!config_id) {
      return res.status(400).json({ error: 'config_id is required' });
    }

    // Check if character exists in database (we can only delete database characters, not hardcoded ones)
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ 
        error: 'Database not available',
        message: 'DATABASE_URL environment variable is required to delete characters'
      });
    }

    const { getCharacterFromDatabase, deleteCharacterFromDatabase } = await import('../services/database');
    const existing = await getCharacterFromDatabase(config_id);
    
    if (!existing) {
      return res.status(404).json({ error: 'Character not found in database. Only database characters can be deleted.' });
    }

    const deleted = await deleteCharacterFromDatabase(config_id);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete character' });
    }

    console.log(`[DELETE /admin/api/characters/:config_id] Character deleted: ${config_id}`);

    res.json({
      message: 'Character deleted successfully',
      config_id,
    });
  } catch (error: any) {
    console.error('[DELETE /admin/api/characters/:config_id] Error deleting character:', error);
    res.status(500).json({
      error: 'Failed to delete character',
      message: error.message
    });
  }
});

// Admin API endpoint to get all characters (including hidden)
// NOTE: This route is defined AFTER the password routes to avoid route conflicts
router.get('/api/characters', checkPassword, async (req: Request, res: Response) => {
  const allCharacters = await getAllCharacters();
  const passwordService = getPasswordService();
  
  // Add password metadata to each character
  const charactersWithPasswordMetadata = await Promise.all(
    allCharacters.map(async (char) => {
      const passwordMetadata = await passwordService.getPasswordMetadata(char.config_id);
      return {
        ...char,
        ...passwordMetadata,
      };
    })
  );
  
  res.json({
    characters: charactersWithPasswordMetadata,
    total: allCharacters.length,
    visible: allCharacters.filter(c => !c.hidden).length,
    hidden: allCharacters.filter(c => c.hidden).length,
  });
});

export default router;

