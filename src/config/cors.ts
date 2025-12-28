export const corsConfig = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  exposedHeaders: ['x-access-token', 'x-access-expires-at'],
};
