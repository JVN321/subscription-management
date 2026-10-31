import { betterAuth } from 'better-auth';
import { db, schema } from '@repo/db';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'brightloop_super_secret_development_key_32_chars_12345',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 9,
    requireSpecialChar: true,
    requireUppercase: true,
    requireLowercase: true
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: true
      }
    }
  }
});
