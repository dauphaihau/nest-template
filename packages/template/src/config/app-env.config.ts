import { z } from 'zod';

type AppEnv = NodeJS.ProcessEnv;

const positiveIntegerString = z
  .string()
  .trim()
  .regex(/^\d+$/, 'Expected a positive integer value.')
  .refine((value) => Number(value) > 0, 'Expected a positive integer value.');

const appEnvBaseSchema = z.object({
  PORT: positiveIntegerString.default('3000'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  API_PREFIX: z.string().trim().min(1).default('api'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 ||
        value.split(',').every((segment) => segment.trim().length > 0),
      'Expected a comma-separated list without empty entries.',
    )
    .optional(),
  DB_HOST: z.string().trim().min(1),
  DB_PORT: positiveIntegerString.default('5432'),
  DB_USER: z.string().trim().min(1),
  DB_PASSWORD: z.string().trim().min(1),
  DB_NAME: z.string().trim().min(1),
  JWT_ACCESS_SECRET: z.string().trim().min(1),
  JWT_REFRESH_SECRET: z.string().trim().min(1),
  JWT_ACCESS_TTL: z.string().trim().min(1),
  JWT_REFRESH_TTL: z.string().trim().min(1),
  BCRYPT_SALT_ROUNDS: positiveIntegerString.default('12'),
  MAIL_DRIVER: z.enum(['logger', 'resend']).default('logger'),
  MAIL_DEFAULT_FROM_EMAIL: z.email().default('noreply@example.com'),
  MAIL_DEFAULT_FROM_NAME: z.string().trim().min(1).default('Nest Template'),
  RESEND_API_KEY: z.string().trim().min(1).optional(),
  STORAGE_DRIVER: z.enum(['local']).default('local'),
  STORAGE_LOCAL_ROOT: z.string().trim().min(1).default('./storage'),
  STORAGE_PUBLIC_BASE_URL: z.url().optional(),
});

const appEnvSchema = appEnvBaseSchema.superRefine((env, context) => {
  if (env.MAIL_DRIVER === 'resend' && !env.RESEND_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['RESEND_API_KEY'],
      message: 'Expected RESEND_API_KEY when MAIL_DRIVER is resend.',
    });
  }
});

export function validateAppEnv(env: AppEnv): AppEnv {
  const parsedEnv = appEnvSchema.safeParse(env);

  if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return {
    ...env,
    ...parsedEnv.data,
  };
}
