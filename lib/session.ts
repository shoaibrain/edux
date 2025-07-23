import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import log from './logger';

export interface UserSession {
  tenantId: string;
  userId: number;
  email: string;
  name: string;
}

/**
 * Retrieves the session from the auth token cookie.
 * Redirects to '/login' if the token is missing or invalid.
 * This function should be used in Server Components and Server Actions to protect routes.
 * @returns {Promise<UserSession>} The decoded user session.
 */
export async function getSession(): Promise<UserSession> {
  const token = (await cookies()).get('authToken')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Verify the token and return the session payload
    const session = verify(token, env.JWT_SECRET) as UserSession;
    return session;
  } catch (e) {
    log.error({ error: e }, 'Invalid session token. Redirecting to login.');
    // If verification fails, redirect to login
    redirect('/login');
  }
}