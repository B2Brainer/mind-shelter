const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return ['http://localhost:5173', 'http://localhost:8080'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export default () => ({
  app: {
    port: toNumber(process.env.PORT ?? process.env.API_PORT, 3001),
    frontendOrigins: toOrigins(process.env.FRONTEND_ORIGIN),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me-for-local-development',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
});

