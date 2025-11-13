/**
 * Image Service Client
 * Handles communication with the Golang image service
 */

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:8090';

export interface UploadImageResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

export interface ImageServiceError {
  error: string;
}

/**
 * Upload an image to the image service
 * @param file - The image file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds maximum limit of 5MB');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${IMAGE_SERVICE_URL}/api/images/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ImageServiceError = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data: UploadImageResponse = await response.json();
    return data.url;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image: ' + (error.message || 'Unknown error'));
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const urlParts = imageUrl.split('/');
  const imageId = urlParts[urlParts.length - 1];

  if (!imageId) {
    throw new Error('Invalid image URL');
  }

  try {
    const response = await fetch(`${IMAGE_SERVICE_URL}/api/images/${imageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData: ImageServiceError = await response.json();
      throw new Error(errorData.error || 'Failed to delete image');
    }
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete image: ' + (error.message || 'Unknown error'));
  }
}

