export const validateEnv = (): void => {
  const requiredEnvs = [
    "PORT",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
  ];

  const missingEnvs = requiredEnvs.filter(
    (env) => !process.env[env],
  );

  if (missingEnvs.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvs.join(", ")}`,
    );
  }
};
