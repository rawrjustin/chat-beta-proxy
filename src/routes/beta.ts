import { Router, Request, Response } from 'express';

const router = Router();

// Beta signup form URL - update this with the actual form link
const BETA_SIGNUP_FORM_URL = process.env.BETA_SIGNUP_FORM_URL || 'https://forms.example.com/beta-signup';

// Beta signup page
router.get('/', (req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Avatar Creation - Beta Signup</title>
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
    
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 60px 40px;
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    
    .icon {
      font-size: 4rem;
      margin-bottom: 20px;
      display: block;
    }
    
    h1 {
      font-size: 2.5rem;
      color: #333;
      margin-bottom: 15px;
      font-weight: 700;
    }
    
    .subtitle {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .description {
      font-size: 1rem;
      color: #555;
      margin-bottom: 40px;
      line-height: 1.8;
    }
    
    .cta-button {
      display: inline-block;
      padding: 18px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    
    .cta-button:active {
      transform: translateY(0);
    }
    
    .features {
      margin-top: 50px;
      text-align: left;
    }
    
    .features h2 {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .feature-list {
      list-style: none;
      padding: 0;
    }
    
    .feature-list li {
      padding: 12px 0;
      color: #555;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .feature-list li::before {
      content: "✨";
      font-size: 1.2rem;
    }
    
    @media (max-width: 600px) {
      .container {
        padding: 40px 30px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1.1rem;
      }
      
      .cta-button {
        padding: 16px 32px;
        font-size: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <span class="icon">🎨</span>
    <h1>3D Avatar Creation</h1>
    <p class="subtitle">Join the Beta</p>
    <p class="description">
      Be among the first to experience our revolutionary 3D avatar creation technology. 
      Sign up now to get early access and help shape the future of digital avatars.
    </p>
    <a href="${BETA_SIGNUP_FORM_URL}" class="cta-button" target="_blank" rel="noopener noreferrer">
      Sign Up for Beta Access
    </a>
    
    <div class="features">
      <h2>What to Expect</h2>
      <ul class="feature-list">
        <li>Early access to cutting-edge 3D avatar creation tools</li>
        <li>Help shape the product with your feedback</li>
        <li>Exclusive updates and previews</li>
        <li>Priority support during the beta period</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;
  
  res.send(html);
});

export default router;

