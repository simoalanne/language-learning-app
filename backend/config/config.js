export const config = {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    usePooling: process.env.USE_POOLING === 'false',
    maxPoolSize: process.env.MAX_POOL_SIZE || 10,
    idleTimeoutMillis: process.env.IDLE_TIMEOUT_MILLIS || 30000,
    connectionTimeoutMillis: process.env.CONNECTION_TIMEOUT_MILLIS || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '7d', // The app does not yet use refresh tokens so the default for access tokens is longer than recommended
  },
  externalApi: {
    geminiApiKey: process.env.GEMINI_API_KEY
  },
};

export const envCheck = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GEMINI_API_KEY',
  ];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
};
