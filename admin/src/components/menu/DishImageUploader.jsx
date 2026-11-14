import React, { useState, useRef } from 'react';
import { uploadDishImage, uploadMultipleDishImages } from '../../services/adminApi';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Plus,
} from 'lucide-react';

export const DishImageUploader = ({
  primaryImage,
  images = [],
  onChangePrimary,
  onChangeImages,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Invalid file type. Please upload a JPG, JPEG, PNG, or WebP image.';
    }
    if (file.size > maxSizeBytes) {
      return `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed size is 10MB.`;
    }
    return null;
  };

  const handleUploadPrimary = async (file) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUploading(true);
    setUploadProgress(10);

    try {
      const res = await uploadDishImage(file, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        onChangePrimary(uploadedUrl);
        // Also add to gallery if not present
        if (!images.includes(uploadedUrl)) {
          onChangeImages([uploadedUrl, ...images]);
        }
        setUploadProgress(100);
        setSuccessMessage('Primary image uploaded successfully!');
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAdditional = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        return;
      }
    }

    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(20);

    try {
      const res = await uploadMultipleDishImages(files, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      const newUrls = (res.data || []).map((item) => item.url).filter(Boolean);
      if (newUrls.length > 0) {
        const updated = [...images, ...newUrls];
        onChangeImages(updated);
        if (!primaryImage && newUrls[0]) {
          onChangePrimary(newUrls[0]);
        }
        setUploadProgress(100);
        setSuccessMessage(`${newUrls.length} image(s) added to gallery!`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to upload additional images.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length === 1 && !primaryImage) {
        handleUploadPrimary(e.dataTransfer.files[0]);
      } else {
        handleUploadAdditional(e.dataTransfer.files);
      }
    }
  };

  const handleRemoveImage = (urlToRemove) => {
    const updated = images.filter((img) => img !== urlToRemove);
    onChangeImages(updated);
    if (primaryImage === urlToRemove) {
      onChangePrimary(updated[0] || '');
    }
  };

  const handleSetPrimary = (url) => {
    onChangePrimary(url);
  };

  const handleMoveImage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);
    onChangeImages(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Status Alerts */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="space-y-1.5 p-3 rounded-2xl bg-orange-50 border border-orange-200">
          <div className="flex justify-between text-xs font-semibold text-[#E8602C]">
            <span>Uploading food photograph...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8602C] transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 1. Primary Food Photograph Section */}
      <div>
        <label className="block font-bold text-[#1A1A1A] mb-1.5 text-xs">
          Primary Food Photograph <span className="text-[#E8602C]">*</span>
        </label>

        {primaryImage ? (
          <div className="relative rounded-2xl border border-[#EAE3D6] overflow-hidden bg-[#FAF6F0] p-3 flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview with 1:1 Aspect Ratio */}
            <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-white border border-[#E0D7C9] shrink-0 shadow-xs">
              <img
                src={primaryImage}
                alt="Primary dish preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-[#E8602C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-white" />
                <span>Primary</span>
              </span>
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs text-[#6B655D]">
                <span className="font-semibold text-[#1A1A1A] block">
                  Active Display Photo
                </span>
                <span className="text-[11px]">
                  Displayed on customer menu cards, Today's Specials, and Food Assistant.
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E0D7C9] hover:border-[#E8602C] hover:text-[#E8602C] text-xs font-semibold text-[#1A1A1A] transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E0D7C9] hover:border-[#E8602C] hover:text-[#E8602C] text-xs font-semibold text-[#1A1A1A] transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take New Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(primaryImage)}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Drag & Drop Primary Image Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-[#E8602C] bg-orange-50/60'
                : 'border-[#E0D7C9] bg-[#FAF6F0]/40 hover:border-[#E8602C]/60 hover:bg-[#FAF6F0]'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#E8602C] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
              Upload Primary Food Photograph
            </h4>
            <p className="text-[11px] text-[#6B655D] mt-1 max-w-sm mx-auto">
              Drag and drop an image here, or select from your device. Supports JPG, PNG, WebP up to 10MB.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E8602C] hover:bg-[#D14E1E] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select from Device</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E0D7C9] hover:border-[#E8602C] text-xs font-semibold text-[#1A1A1A] transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#E8602C]" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden inputs for primary upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUploadPrimary(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleUploadPrimary(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
      </div>

      {/* 2. Additional Photographs Gallery Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block font-bold text-[#1A1A1A] text-xs">
              Additional Photos Gallery (Optional)
            </label>
            <span className="text-[10px] text-[#6B655D]">
              Shown in customer dish details modal carousel.
            </span>
          </div>

          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#E0D7C9] hover:border-[#E8602C] text-[#E8602C] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photos</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FAF6F0] border border-[#EAE3D6]">
            {images.map((imgUrl, idx) => {
              const isPrimary = imgUrl === primaryImage;

              return (
                <div
                  key={idx}
                  className={`relative group rounded-xl overflow-hidden border bg-white aspect-square flex flex-col justify-between transition-all ${
                    isPrimary
                      ? 'border-[#E8602C] ring-2 ring-[#E8602C]/20 shadow-xs'
                      : 'border-[#EAE3D6] hover:border-[#E8602C]/50'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Dish photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Indicator or Select Primary Button */}
                  {isPrimary ? (
                    <div className="absolute top-1.5 left-1.5 bg-[#E8602C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>Primary</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(imgUrl)}
                      className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-[#E8602C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      Make Primary
                    </button>
                  )}

                  {/* Top-Right: Delete button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(imgUrl)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Bottom: Reorder controls */}
                  <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, -1)}
                      className="w-6 h-6 rounded-full bg-black/60 disabled:opacity-30 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                      title="Move left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, 1)}
                      className="w-6 h-6 rounded-full bg-black/60 disabled:opacity-30 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                      title="Move right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl border border-dashed border-[#EAE3D6] bg-white text-[11px] text-[#8C8275]">
            No additional gallery photos added yet. Upload more photos to enrich the dish details view.
          </div>
        )}

        {/* Hidden input for multiple gallery photos */}
        <input
          ref={galleryInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUploadAdditional(e.target.files);
              e.target.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};
