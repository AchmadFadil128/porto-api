import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { isUserAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    // Fetch all projects, including screenshots
    const projectsData = await db
      .select({
        id: projects.id,
        slug: projects.slug,
        title: projects.title,
        short_description: projects.short_description,
        image_base64: projects.image_base64,
        description: projects.description,
        live_demo_url: projects.live_demo_url,
        github_repo_url: projects.github_repo_url,
        screenshots: projects.screenshots,
        created_at: projects.created_at,
        updated_at: projects.updated_at,
      })
      .from(projects)
      .orderBy(desc(projects.created_at));

    return NextResponse.json(projectsData);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Check if user is authenticated
  if (!(await isUserAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    // Extract text fields from formData
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const short_description = formData.get('short_description') as string;
    const description = formData.get('description') as string | null;
    const live_demo_url = formData.get('live_demo_url') as string | null;
    const github_repo_url = formData.get('github_repo_url') as string | null;
    const screenshots = formData.get('screenshots') ? JSON.parse(formData.get('screenshots') as string) : [];

    // Validate required fields
    if (!title || !slug || !short_description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process main image file to Base64
    const imageFile = formData.get('image') as File | null;
    let image_base64 = '';
    
    if (imageFile) {
      // Validate file type (only images)
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed for main image' }, { status: 400 });
      }
      
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64String = buffer.toString('base64');
      // Add data URL prefix
      image_base64 = `data:${imageFile.type};base64,${base64String}`;
    } else {
      return NextResponse.json({ error: 'Main image is required' }, { status: 400 });
    }

    // Check if slug already exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug));
    
    if (existingProject.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Insert the new project with Base64 image
    const [newProject] = await db
      .insert(projects)
      .values({
        title,
        slug,
        short_description,
        image_base64,
        description: description || null,
        live_demo_url: live_demo_url || null,
        github_repo_url: github_repo_url || null,
        screenshots: screenshots || [],
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}