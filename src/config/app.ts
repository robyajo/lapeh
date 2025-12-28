export const appConfig = {
  name: 'Lapeh API',
  timeout: 30000, // 30 seconds
  compression: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  },
};
