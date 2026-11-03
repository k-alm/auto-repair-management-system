import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default("0.0.0.0"),
  ALLOWED_ORIGINS: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  APPROVAL_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(72),
  TRACKING_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(90),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.email().default("oficina@example.com"),
  PUBLIC_API_URL: z.url().default("http://localhost:3333"),
  APP_TIME_ZONE: z.string().default("America/Sao_Paulo"),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export const env = envSchema
  .superRefine((config, context) => {
    if (config.NODE_ENV === "production" && !config.SMTP_HOST) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_HOST"],
        message: "SMTP_HOST é obrigatório em produção",
      });
    }
    if (Boolean(config.SMTP_USER) !== Boolean(config.SMTP_PASSWORD)) {
      context.addIssue({
        code: "custom",
        path: ["SMTP_PASSWORD"],
        message: "SMTP_USER e SMTP_PASSWORD devem ser configurados juntos",
      });
    }
  })
  .parse(process.env);
