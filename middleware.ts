import { NextRequest, NextResponse } from 'next/server';
import { isUserAuthenticated } from '@/lib/auth';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export function middleware(request: NextRequest) {
  // Handle requests for uploaded files
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const filename = request.nextUrl.pathname.split('/uploads/')[1];
    if (filename) {
      const filePath = join(process.cwd(), 'public', 'uploads', filename);
      
      // Check if the file exists
      if (existsSync(filePath)) {
        try {
          const fileBuffer = readFileSync(filePath);
          const ext = filename.split('.').pop()?.toLowerCase() || 'png';
          
          // Determine content type based on extension
          const contentType = getContentType(ext);
          
          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        } catch (error) {
          console.error('Error reading uploaded file:', error);
        }
      }
      
      // If file doesn't exist, return 404
      return new NextResponse('File not found', { status: 404 });
    }
  }
  
  // Check if the requested path is under /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // If user is not authenticated, redirect to login
    if (!isUserAuthenticated()) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    'tiff': 'image/tiff',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
  };
  
  return types[ext] || 'application/octet-stream';
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/uploads/:path*'],
};