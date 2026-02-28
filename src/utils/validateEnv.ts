const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'ADJUTOR_BASE_URL',
  'ADJUTOR_API_KEY',
  'ENCRYPTION_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      'Check your .env file against .env.example.',
    );
  }
}
