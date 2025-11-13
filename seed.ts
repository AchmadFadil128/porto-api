import { config } from 'dotenv';
config();

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debug log
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Dynamically import db after environment variables are loaded
    const { db } = await import('./src/lib/db');
    const { projects } = await import('./src/db/schema');

    // Clear existing data
    await db.delete(projects);
    
    // Insert sample projects
    // Note: Using placeholder image URLs. In production, these should be URLs from the image service
    await db.insert(projects).values([
      {
        slug: "personal-portfolio-website",
        title: "Personal Portfolio Website",
        short_description: "This project is a personal portfolio website built with Next.js and Tailwind CSS to showcase my work and skills.",
        image_url: "https://via.placeholder.com/800x450?text=Personal+Portfolio+Website",
        description: "This website was built to showcase my work and skills...",
        live_demo_url: "https://example-portfolio.vercel.app",
        github_repo_url: "https://github.com/user/portfolio-repo",
        screenshots: [
          "https://via.placeholder.com/800x450?text=Screenshot+1+Portfolio",
          "https://via.placeholder.com/800x450?text=Screenshot+2+Portfolio"
        ]
      },
      {
        slug: "to-do-list-app",
        title: "To-Do List Application",
        short_description: "An application for managing daily tasks with a clean and intuitive interface.",
        image_url: "https://via.placeholder.com/800x450?text=To-Do+List+App",
        description: "A full-featured to-do list application...",
        live_demo_url: "https://example-todo.vercel.app",
        github_repo_url: "https://github.com/user/todo-repo",
        screenshots: [
          "https://via.placeholder.com/800x450?text=Screenshot+1+TODO",
          "https://via.placeholder.com/800x450?text=Screenshot+2+TODO"
        ]
      }
    ]);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();