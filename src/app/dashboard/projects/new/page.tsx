'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ScreenshotUpload from '@/components/ScreenshotUpload';

// Define the form schema using Zod (we still validate the text fields)
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().min(1, 'Short description is required'),
  description: z.string().optional(),
  live_demo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github_repo_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<FormData>({
    resolver: zodResolver(projectSchema),
  });

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setFormError('image_file', { message: 'Please upload an image file' });
        return;
      }
      
      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('title', data.title);
      formData.append('slug', data.slug);
      formData.append('short_description', data.short_description);
      if (data.description) formData.append('description', data.description);
      if (data.live_demo_url) formData.append('live_demo_url', data.live_demo_url);
      if (data.github_repo_url) formData.append('github_repo_url', data.github_repo_url);
      
      // Append main image file if selected
      if (mainImageInputRef.current && mainImageInputRef.current.files && mainImageInputRef.current.files[0]) {
        const imageFile = mainImageInputRef.current.files[0];
        if (!imageFile.type.startsWith('image/')) {
          setError('Please select an image file for the main image');
          setIsSubmitting(false);
          return;
        }
        formData.append('image', imageFile);
      } else {
        setError('Main image is required');
        setIsSubmitting(false);
        return;
      }
      
      // Append screenshots as JSON string
      formData.append('screenshots', JSON.stringify(screenshots));

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/dashboard/projects');
        router.refresh();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create project');
      }
    } catch (err) {
      setError('An error occurred while creating the project');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            id="title"
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.title ? 'border-red-500' : ''}`}
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            id="slug"
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.slug ? 'border-red-500' : ''}`}
            {...register('slug')}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
            Short Description *
          </label>
          <textarea
            id="short_description"
            rows={3}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.short_description ? 'border-red-500' : ''}`}
            {...register('short_description')}
          ></textarea>
          {errors.short_description && (
            <p className="mt-1 text-sm text-red-600">{errors.short_description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700">
            Main Image *
          </label>
          <input
            id="mainImage"
            type="file"
            ref={mainImageInputRef}
            onChange={handleMainImageChange}
            accept="image/*"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.image_file && (
            <p className="mt-1 text-sm text-red-600">{errors.image_file.message}</p>
          )}
          {mainImagePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Preview:</p>
              <img 
                src={mainImagePreview} 
                alt="Preview" 
                className="mt-1 h-32 object-contain border rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Full Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register('description')}
          ></textarea>
        </div>

        <div>
          <label htmlFor="live_demo_url" className="block text-sm font-medium text-gray-700">
            Live Demo URL
          </label>
          <input
            id="live_demo_url"
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.live_demo_url ? 'border-red-500' : ''}`}
            {...register('live_demo_url')}
          />
          {errors.live_demo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.live_demo_url.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="github_repo_url" className="block text-sm font-medium text-gray-700">
            GitHub Repository URL
          </label>
          <input
            id="github_repo_url"
            type="text"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${errors.github_repo_url ? 'border-red-500' : ''}`}
            {...register('github_repo_url')}
          />
          {errors.github_repo_url && (
            <p className="mt-1 text-sm text-red-600">{errors.github_repo_url.message}</p>
          )}
        </div>

        {/* Screenshot Upload */}
        <div>
          <ScreenshotUpload 
            screenshots={screenshots} 
            onScreenshotsChange={setScreenshots} 
            label="Project Screenshots"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}