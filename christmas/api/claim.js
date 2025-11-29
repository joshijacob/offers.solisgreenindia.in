// /christmas/api/claim.js
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
    const { 
      revealToken, 
      name, 
      phone, 
      ksebConsumer, 
      ksebPhone, 
      location 
    } = req.body;

    // Validate required fields
    if (!name || !phone || !ksebConsumer || !ksebPhone || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate phone format (Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    if (!phoneRegex.test(ksebPhone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'Please enter a valid KSEB registered phone number' });
    }

    // Prepare lead data
    const leadData = {
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      name: name.trim(),
      phone: phone.trim(),
      ksebConsumer: ksebConsumer.trim(),
      ksebPhone: ksebPhone.trim(),
      location: location.trim(),
      revealToken: revealToken,
      prizeAmount: 5000,
      source: 'Christmas Offer 2024',
      status: 'new'
    };

    // Log the lead (you'll see this in Vercel logs)
    console.log('🎄 NEW CHRISTMAS LEAD:', JSON.stringify(leadData, null, 2));

    // For now, we'll just return success
    // Later you can add email notifications, Google Sheets, etc.

    res.status(200).json({
      success: true,
      message: '🎉 Claim submitted successfully! We will contact you within 24 hours.',
      referenceId: revealToken
    });

  } catch (error) {
    console.error('Claim API error:', error);
    res.status(500).json({ error: 'Failed to submit claim. Please try again.' });
  }
}
