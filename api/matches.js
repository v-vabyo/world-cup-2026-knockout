export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Completely disable caching to guarantee instant Live Score updates
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // In production, the API Key should be set in Vercel Environment Variables
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    const apiRes = await fetch(`https://api.football-data.org/v4/matches?t=${Date.now()}`, {
      headers: {
        'X-Auth-Token': apiKey,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!apiRes.ok) {
      throw new Error('API request failed');
    }
    
    const data = await apiRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
