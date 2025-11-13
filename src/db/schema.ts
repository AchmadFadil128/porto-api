import { pgTable, text, varchar, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  short_description: text("short_description").notNull(),
  image_url: text("image_url").notNull(), 
  description: text("description"),
  live_demo_url: text("live_demo_url"),
  github_repo_url: text("github_repo_url"),
  screenshots: text("screenshots").array(), 
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
}, (table) => {
  return {
    slugIdx: uniqueIndex("slug_idx").on(table.slug),
  }
});