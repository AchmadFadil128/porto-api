export type Project = {
  id: number;
  slug: string;
  title: string;
  short_description: string;
  image_url: string;
  description?: string | null;
  live_demo_url?: string | null;
  github_repo_url?: string | null;
  screenshots?: string[] | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};