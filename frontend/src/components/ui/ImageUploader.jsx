import React, { useState, useRef } from 'react';
import { api } from '../../services/api';

export const ImageUploader = ({
  currentImageUrl,
  uploadEndpoint, // Deprecated, kept for backward compatibility
  confirmEndpoint,
  onUploadSuccess,
  label = "Upload Image",
  className = ""
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const inputId = useRef(`image-upload-${Math.random().toString(36).substring(2, 9)}`).current;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
     
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid file (JPEG, PNG, WebP, PDF).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // We now upload directly to the confirmEndpoint which has been updated
      // in the backend to accept multipart/form-data.
      const { data } = await api.patch(confirmEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success && data.url) {
        onUploadSuccess(data.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to upload image");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      {currentImageUrl && (
        currentImageUrl.toLowerCase().endsWith('.pdf') ? (
          <div className="w-full h-32 flex items-center justify-center bg-surface border border-border rounded-lg text-ink-muted">
            <a href={currentImageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-sm">View PDF Document</a>
          </div>
        ) : (
          <img 
            src={currentImageUrl} 
            alt="Uploaded content" 
            className="w-full max-h-48 object-contain rounded-lg border border-border"
          />
        )
      )}
      <div>
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          id={inputId}
          disabled={loading}
        />
        <label
          htmlFor={inputId}
          className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Uploading...' : label}
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
