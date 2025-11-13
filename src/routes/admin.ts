import { Router, Request, Response } from 'express';
import { getAllCharacters } from '../config/characters';

const router = Router();
const ADMIN_PASSWORD = 'genies';

// Simple password check middleware
const checkPassword = (req: Request, res: Response, next: Function) => {
  const password = req.body.password || req.query.password;
  
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
router.get('/', checkPassword, (req: Request, res: Response) => {
  const allCharacters = getAllCharacters();
  
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

// Admin API endpoint to get all characters (including hidden)
router.get('/api/characters', checkPassword, (req: Request, res: Response) => {
  const allCharacters = getAllCharacters();
  res.json({
    characters: allCharacters,
    total: allCharacters.length,
    visible: allCharacters.filter(c => !c.hidden).length,
    hidden: allCharacters.filter(c => c.hidden).length,
  });
});

export default router;

