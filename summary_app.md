# 📘 Technical Specification – Portfolio API & Admin Dashboard

## 1. Project Structure

* **Type**: Monolithic (API + Admin Dashboard in 1 project).
* **Framework**: Next.js (App Router).
* **Styling/UI**: TailwindCSS + shadcn/ui.
* **Database**: PostgreSQL (Dockerized).
* **ORM**: Drizzle ORM.
* **Port**: `3001` (API + Dashboard).

There is already a separate frontend service that will consume the API endpoints from this project, so the API must be clean and well-structured.

Proposed structure:

```
/app
  /api
    /projects
      route.ts (GET, POST)
    /projects/[slug]
      route.ts (GET, PUT, DELETE)
  /dashboard
    /projects
      page.tsx (list view)
      /new/page.tsx (create form)
      /[id]/edit/page.tsx (edit form)
  /auth/login
    page.tsx
/components
/lib
  db.ts (drizzle config)
/public/uploads (image uploads)
```

---

## 2. Database Schema

Using Drizzle ORM, `projects` table:

```ts
import { pgTable, text, varchar, serial, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  short_description: text("short_description").notNull(),
  image_url: text("image_url").notNull(),
  description: text("description"),
  live_demo_url: text("live_demo_url"),
  github_repo_url: text("github_repo_url"),
  screenshots: text("screenshots").array(), // stored as text[]
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
});
```

---

## 3. Authentication

* **Method**: Static username/password stored in `.env` (e.g., `ADMIN_USER=admin`, `ADMIN_PASS=admin`).
* **Mechanism**: Simple session with cookies (JWT optional but not required).
* **Access Control**:

  * Public API → no auth required. /projects and /projects/[slug] are the Public API
  * Dashboard (`/dashboard/*`) → requires login.

---

## 4. Admin Dashboard

* Built with **Next.js App Router + shadcn/ui**.
* Features:

  * View projects (`/dashboard/projects`).
  * Create new project (`/dashboard/projects/new`).
  * Edit project (`/dashboard/projects/[id]/edit`).
  * Delete project.
* **Validation** (basic rules):

  * `slug` must be unique.
  * `title`, `short_description`, `image_url` required.
* **Image Upload**: Stored locally in `/public/uploads`. Form handles file input → saved → store URL in DB.

---

## 5. API Endpoints

### Public

* `GET /api/projects`
  Returns subset of projects (id, slug, title, short\_description, image\_url).

* `GET /api/projects/[slug]`
  Returns full details of a project.

### Admin (Protected)

* `POST /api/projects` → Create project.
* `PUT /api/projects/[id]` → Update project.
* `DELETE /api/projects/[id]` → Delete project.

**Error format** (example):

```json
{ "error": "Project not found" }
```

---

## 6. Deployment

* **Target**: Self-hosted (VPS with Docker Compose).
* Services:

  * `nextjs-service` (API + Dashboard).
  * `postgres-service`.
* Env variables:

  * `DATABASE_URL`
  * `ADMIN_USER`, `ADMIN_PASS`
  * `PORT=3001`

---

## 7. Testing

* **Unit Testing**: Jest/Vitest for DB & utilities.
* **API Testing**: Supertest/Next API testing.
* **Seeding**: Provide mock projects on migration (`drizzle-kit seed`).

Example seed (matches frontend mock data):

```ts
await db.insert(projects).values([
  {
    slug: "personal-portfolio-website",
    title: "Personal Portfolio Website",
    short_description: "This project is a personal portfolio website built with Next.js and Tailwind CSS to showcase my work and skills.",
    image_url: "/images/portfolio-thumbnail.jpg",
    description: "This website was built to showcase my work and skills...",
    live_demo_url: "https://example-portfolio.vercel.app",
    github_repo_url: "https://github.com/user/portfolio-repo",
    screenshots: ["/images/screenshot1.jpg", "/images/screenshot2.jpg"]
  },
  {
    slug: "to-do-list-app",
    title: "To-Do List Application",
    short_description: "An application for managing daily tasks with a clean and intuitive interface.",
    image_url: "/images/todo-thumbnail.jpg",
    description: "A full-featured to-do list application...",
    live_demo_url: "https://example-todo.vercel.app",
    github_repo_url: "https://github.com/user/todo-repo",
    screenshots: ["/images/todo-screenshot1.jpg", "/images/todo-screenshot2.jpg"]
  }
]);
```

---

## 8. Logging & Errors

* Minimal logging: `console.log` for development.
* Standardized JSON error response for API.

---
