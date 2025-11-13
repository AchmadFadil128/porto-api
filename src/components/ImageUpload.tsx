'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadImage } from '@/lib/imageService';

interface ImageUploadProps {
  imageUrl: string | null;
  onImageUrlChange: (imageUrl: string | null) => void;
  label?: string;
}

export default function ImageUpload({ 
  imageUrl, 
  onImageUrlChange, 
  label = 'Project Image' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const uploadedUrl = await uploadImage(file);
      onImageUrlChange(uploadedUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onImageUrlChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const removeImage = useCallback(() => {
    onImageUrlChange(null);
  }, [onImageUrlChange]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
        <div 
          className="cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-indigo-600 hover:text-indigo-500">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Preview of uploaded image */}
      {imageUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</h3>
          <div className="relative group">
            <img 
              src={imageUrl.startsWith('/') ? imageUrl : imageUrl} 
              alt="Project main image"
              className="w-full max-w-md h-auto object-contain rounded-md border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}