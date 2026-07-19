import React, { useState, useRef } from 'react';
import { api } from '../../services/api';

export const ImageUploader = ({
  currentImageUrl,
  uploadEndpoint,
  confirmEndpoint,
  onUploadSuccess,
  label = "Upload Image",
  className = ""
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
     
    // Validate type roughly on client side
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, WebP).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Get presigned URL
      const { data: { uploadUrl, objectKey } } = await api.post(uploadEndpoint, {
        contentType: file.type
      });

      // 2. Upload directly to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      // 3. Confirm with backend
      const { data } = await api.patch(confirmEndpoint, {
        objectKey
      });

      if (data.success && data.url) {
        onUploadSuccess(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || err.message || "Failed to upload image");
    } finally {
      setLoading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      {currentImageUrl && (
        <img 
          src={currentImageUrl} 
          alt="Current" 
          className="w-32 h-32 object-cover rounded-lg border border-gray-200" 
        />
      )}
      <div>
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          id="image-upload"
          disabled={loading}
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Uploading...' : label}
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
