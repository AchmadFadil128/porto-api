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
    
    // Extract fields from request body
    const title = body.title as string | null;
    const slugValue = body.slug as string | null;
    const short_description = body.short_description as string | null;
    const description = body.description as string | null;
    const live_demo_url = body.live_demo_url as string | null;
    const github_repo_url = body.github_repo_url as string | null;
    const image_url = body.image_url as string | null;
    const screenshots = body.screenshots ? (Array.isArray(body.screenshots) ? body.screenshots : null) : null;

    // Check if the new slug already exists (if different from current)
    if (slugValue && slugValue !== slug) {
      const duplicateCheck = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, slugValue));
      
      if (duplicateCheck.length > 0) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    // Validate image_url if provided
    if (image_url) {
      try {
        new URL(image_url);
      } catch {
        return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
      }
    }

    // Update the project
    const [updatedProject] = await db
      .update(projects)
      .set({
        title: title !== null && title !== undefined ? title : existingProject[0].title,
        slug: slugValue !== null && slugValue !== undefined ? slugValue : existingProject[0].slug,
        short_description: short_description !== null && short_description !== undefined ? short_description : existingProject[0].short_description,
        image_url: image_url !== null && image_url !== undefined ? image_url : existingProject[0].image_url,
        description: description !== null && description !== undefined ? description : existingProject[0].description,
        live_demo_url: live_demo_url !== null && live_demo_url !== undefined ? live_demo_url : existingProject[0].live_demo_url,
        github_repo_url: github_repo_url !== null && github_repo_url !== undefined ? github_repo_url : existingProject[0].github_repo_url,
        screenshots: screenshots !== null && screenshots !== undefined ? screenshots : existingProject[0].screenshots,
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