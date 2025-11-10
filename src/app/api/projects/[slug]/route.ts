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
        image_base64: projects.image_base64,
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

    const formData = await request.formData();
    
    // Extract text fields from formData
    const title = formData.get('title') as string | null;
    const slugValue = formData.get('slug') as string | null;
    const short_description = formData.get('short_description') as string | null;
    const description = formData.get('description') as string | null;
    const live_demo_url = formData.get('live_demo_url') as string | null;
    const github_repo_url = formData.get('github_repo_url') as string | null;
    const screenshots = formData.get('screenshots') ? JSON.parse(formData.get('screenshots') as string) : null;

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

    // Process main image file to Base64 if provided
    let image_base64 = existingProject[0].image_base64; // Default to existing value
    const imageFile = formData.get('image') as File | null;
    
    if (imageFile) {
      // Validate file type (only images)
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed for main image' }, { status: 400 });
      }
      
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64String = buffer.toString('base64');
      // Add data URL prefix
      image_base64 = `data:${imageFile.type};base64,${base64String}`;
    }

    // Update the project
    const [updatedProject] = await db
      .update(projects)
      .set({
        title: title || existingProject[0].title,
        slug: slugValue || existingProject[0].slug,
        short_description: short_description || existingProject[0].short_description,
        image_base64,
        description: description !== null ? description : existingProject[0].description,
        live_demo_url: live_demo_url || existingProject[0].live_demo_url,
        github_repo_url: github_repo_url || existingProject[0].github_repo_url,
        screenshots: screenshots !== null ? screenshots : existingProject[0].screenshots,
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