export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'OK',
    message: 'Masterful API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
