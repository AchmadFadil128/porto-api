'use client';

import { useState, useRef, useCallback } from 'react';

interface ScreenshotUploadProps {
  screenshots: string[];
  onScreenshotsChange: (screenshots: string[]) => void;
  label?: string;
}

export default function ScreenshotUpload({ 
  screenshots, 
  onScreenshotsChange, 
  label = 'Screenshots' 
}: ScreenshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { imageUrl } = await res.json();
      onScreenshotsChange([...screenshots, imageUrl]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [screenshots, onScreenshotsChange]);

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

  const removeScreenshot = useCallback((index: number) => {
    const newScreenshots = [...screenshots];
    newScreenshots.splice(index, 1);
    onScreenshotsChange(newScreenshots);
  }, [screenshots, onScreenshotsChange]);

  const addFromUrl = useCallback((url: string) => {
    if (url.trim()) {
      onScreenshotsChange([...screenshots, url.trim()]);
    }
  }, [screenshots, onScreenshotsChange]);

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

      {/* Add from URL */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Or enter image URL"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addFromUrl((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
            addFromUrl(input.value);
            input.value = '';
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Add URL
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {/* Preview of uploaded screenshots */}
      {screenshots.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Screenshots:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {screenshots.map((screenshot, index) => (
              <div key={index} className="relative group">
                <img 
                  src={screenshot} 
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border"
                  onError={(e) => {
                    // Provide fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSA1MEwzNy41IDYyLjVMNzUgMjVMNzUgNzVMMzcuNSA3NUw1MCA4Ny41TDEyLjUgNTBaIiBzdHJva2U9IiM3RjdGN0YiIHN0cm9rZS13aWR0aD0iNSIvPgo8L3N2Zz4K';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}