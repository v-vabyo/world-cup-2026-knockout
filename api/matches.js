export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache for 10 seconds on CDN, serve stale up to 1 hour while updating in background
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // In production, the API Key should be set in Vercel Environment Variables
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    const apiRes = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: {
        'X-Auth-Token': apiKey
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
