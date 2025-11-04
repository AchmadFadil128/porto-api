import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

export async function authenticateUser(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USER) {
    // For static credentials, we just compare directly
    // In a real app, ADMIN_PASS would be hashed
    return password === ADMIN_PASS;
  }
  return false;
}

export async function isUserAuthenticated(): Promise<boolean> {
  const sessionCookie = await cookies().get('session');
  if (!sessionCookie) return false;
  
  try {
    const sessionData = JSON.parse(atob(sessionCookie.value));
    return sessionData.valid === true && sessionData.user === ADMIN_USER;
  } catch {
    return false;
  }
}

export async function createSession(): Promise<void> {
  const sessionData = {
    valid: true,
    user: ADMIN_USER,
    createdAt: new Date().toISOString(),
  };
  
  const sessionCookie = btoa(JSON.stringify(sessionData));
  await cookies().set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    sameSite: 'strict',
  });
}

export async function destroySession(): Promise<void> {
  await cookies().delete('session');
}