CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"short_description" text NOT NULL,
	"image_url" text NOT NULL,
	"description" text,
	"live_demo_url" text,
	"github_repo_url" text,
	"screenshots" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "projects" USING btree ("slug");