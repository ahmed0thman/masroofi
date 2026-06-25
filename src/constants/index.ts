import { z } from 'zod';
const constantsSchema = z.object({
  ONBOARDING_COMPLETED_KEY: z.string().default('onboarding_completed'),
  RECOREDINGS_DIRECTORY: z.string().default('recordings'),
});
