import { NextRequest, NextResponse } from 'next/server';
import { isUserAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Check if user is authenticated
  if (!(await isUserAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type (only images)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Convert file to Base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64String = buffer.toString('base64');
    // Return the Base64 string with proper data URL prefix
    const base64Url = `data:${file.type};base64,${base64String}`;
    
    return NextResponse.json({ imageUrl: base64Url }, { status: 201 });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}