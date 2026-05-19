const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export default () => ({
  app: {
    port: toNumber(process.env.PORT ?? process.env.API_PORT, 3001),
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  },
});
