import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, destroySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const isAuthenticated = await authenticateUser(username, password);

  if (isAuthenticated) {
    await createSession();
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}