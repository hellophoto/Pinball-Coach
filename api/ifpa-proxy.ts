import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { playerId } = req.query;
  
  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ error: 'Player ID required' });
  }

  const apiKey = process.env.IFPA_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'IFPA API key not configured' });
  }

  try {
    const response = await fetch(
      `https://api.ifpapinball.com/v1/player/${playerId}/results?api_key=${apiKey}`
    );
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `IFPA API error: ${response.statusText}` });
    }
    
    const data = await response.json();
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.json(data);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMsg });
  }
}