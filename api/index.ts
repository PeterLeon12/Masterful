export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different API routes
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  if (pathname === '/api/health') {
    res.status(200).json({
      status: 'OK',
      message: 'Masterful API is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } else if (pathname === '/api/test') {
    res.status(200).json({
      message: 'API test endpoint working!',
      method: req.method,
      path: pathname
    });
  } else {
    res.status(404).json({
      error: 'Not found',
      message: 'API endpoint not found',
      path: pathname
    });
  }
}