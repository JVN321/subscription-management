# Authentication: Better Auth

> **Status: Confirmed Architecture**
>
> Authentication, identity management, session verification, and password reset flows using Better Auth.

---

## 1. Role & Technology Overview

**Better Auth** is the designated identity and session management framework. It handles user registration, password hashing (Argon2 / scrypt), session lifecycle, email verification, and password resets while using the existing PostgreSQL database via the Drizzle adapter.

Key Requirements Fulfilled:
- **Email Uniqueness**: Enforced at both Better Auth and PostgreSQL database levels.
- **Password Strength**: Minimum 8 characters, containing uppercase, lowercase, and special characters.
- **Password Reset**: Secure, time-limited token delivery via Resend email.
- **Role Integration**: Injects user role (`admin`, `staff`, `customer`) into session tokens for instant RBAC enforcement.

---

## 2. Integration with Hono (`apps/api`)

Better Auth is mounted onto the Hono API under `/api/v1/auth/*`:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@repo/db';
import * as schema from '@repo/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications
    }
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 9,
    requireSpecialChar: true,
    requireUppercase: true,
    requireLowercase: true,
    sendResetPasswordEmail: async ({ user, url }) => {
      await emailQueue.add('send_password_reset', { email: user.email, resetUrl: url });
    }
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
```

---

## 3. Session Middleware & Role Enforcement

Every incoming request to a protected API endpoint passes through the Better Auth Hono middleware:

```typescript
export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, 401);
  }
  c.set('user', session.user);
  c.set('session', session.session);
  return next();
}

export function requireRole(...allowedRoles: Array<'admin' | 'staff' | 'customer'>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 403);
    }
    return next();
  };
}
```

---

## 4. Frontend Integration (`apps/web`)

The TanStack Start frontend uses the Better Auth React client (`createAuthClient`), providing reactive hooks:
```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.VITE_API_URL || 'http://localhost:3001'
});

export const { useSession, signIn, signOut } = authClient;
```
