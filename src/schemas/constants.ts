import { z } from 'zod';

export const constantsSchema = z.object({
  ONBOARDING_COMPLETED_KEY: z.string().default('onboarding_completed'),
  RECOREDINGS_DIRECTORY: z.string().default('recordings'),
});

export type Constants = z.infer<typeof constantsSchema>;
