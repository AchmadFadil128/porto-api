import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isUserAuthenticated } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    // Fetch a single project by slug, returning all fields including screenshots
    const project = await db
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
      .where(eq(projects.slug, slug))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project[0]);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!(await isUserAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the project from the database using the slug
    const existingProject = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();

    // Check if the new slug already exists (if different from current)
    if (body.slug && body.slug !== slug) {
      const duplicateCheck = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, body.slug));
      
      if (duplicateCheck.length > 0) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    // Update the project
    const [updatedProject] = await db
      .update(projects)
      .set({
        title: body.title || existingProject[0].title,
        slug: body.slug || existingProject[0].slug,
        short_description: body.short_description || existingProject[0].short_description,
        image_url: body.image_url || existingProject[0].image_url,
        description: body.description !== undefined ? body.description : existingProject[0].description,
        live_demo_url: body.live_demo_url || existingProject[0].live_demo_url,
        github_repo_url: body.github_repo_url || existingProject[0].github_repo_url,
        screenshots: body.screenshots !== undefined ? body.screenshots : existingProject[0].screenshots,
      })
      .where(eq(projects.slug, slug))
      .returning();

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  // Check if user is authenticated
  if (!(await isUserAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the project by slug
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Delete the project
    await db
      .delete(projects)
      .where(eq(projects.slug, slug));

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}