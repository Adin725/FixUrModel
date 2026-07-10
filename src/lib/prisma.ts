export const prismaConfig = {
  isConfigured: Boolean(process.env.DATABASE_URL),
  provider: "postgresql",
};
