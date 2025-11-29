// /christmas/api/reveal.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In production, you'd use Vercel KV for persistent counter
    // For now, we'll simulate the click counter logic
    const simulatedCount = Math.floor(Math.random() * 100) + 1;
    let prize = 5000; // Default
    
    // Your prize logic
    if (simulatedCount % 75 === 0) prize = 25000;
    else if (simulatedCount % 40 === 0) prize = 20000;
    else if (simulatedCount % 25 === 0) prize = 15000;
    else if (simulatedCount % 10 === 0) prize = 10000;

    // Generate unique token
    const revealToken = 'chr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Set expiration (10 minutes)
    const expiresIn = 600;

    const response = {
      success: true,
      prize: prize,
      revealToken: revealToken,
      expiresIn: expiresIn,
      message: `🎉 You've unlocked ₹${prize.toLocaleString()}!`,
      simulatedCount: simulatedCount // Remove this in production
    };

    console.log('🎄 Reveal generated:', { token: revealToken, prize, simulatedCount });

    res.status(200).json(response);
    
  } catch (error) {
    console.error('Reveal API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process reveal request' 
    });
  }
}
