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
        image_url: projects.image_url,
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
    const body = await request.json();
    
    // Extract fields from request body
    const title = body.title as string;
    const slug = body.slug as string;
    const short_description = body.short_description as string;
    const description = body.description as string | null;
    const live_demo_url = body.live_demo_url as string | null;
    const github_repo_url = body.github_repo_url as string | null;
    const image_url = body.image_url as string;
    const screenshots = body.screenshots ? (Array.isArray(body.screenshots) ? body.screenshots : []) : [];

    // Validate required fields
    if (!title || !slug || !short_description || !image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate image_url is a valid URL
    try {
      new URL(image_url);
    } catch {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // Check if slug already exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug));
    
    if (existingProject.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Insert the new project with image URL
    const [newProject] = await db
      .insert(projects)
      .values({
        title,
        slug,
        short_description,
        image_url,
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