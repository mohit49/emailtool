'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  uploadEndpoint: string;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  images,
  onImagesChange,
  uploadEndpoint,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUploadError('Please login to upload images');
        setUploading(false);
        return;
      }

      const newImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError('Only image files are allowed');
          continue;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setUploadError('File size must be less than 10MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        newImages.push(data.url);
      }

      onImagesChange([...images, ...newImages]);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Images (Optional)
      </label>
      
      {uploadError && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {uploadError}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {!disabled && images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors ${
              uploading || disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <span className="text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">
                  {images.length > 0 ? 'Add More Images' : 'Upload Images'}
                </span>
                <span className="text-sm text-gray-500">
                  ({images.length}/{maxImages})
                </span>
              </>
            )}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: JPEG, PNG, GIF, WebP. Max size: 10MB per image.
          </p>
        </div>
      )}
    </div>
  );
}
