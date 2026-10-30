"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, Sparkles } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelected: (file: File, previewUrl: string) => void;
  onUseDemo: () => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function ImageUploader({ onImageSelected, onUseDemo }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage(
        "Unsupported file type. Please upload a photographic JPG, PNG, or WebP image."
      );
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(
          file.size
        )}). Please select an image under 5 MB.`
      );
      return;
    }

    if (file.size === 0) {
      setErrorMessage("The selected file is empty.");
      return;
    }

    // Read and verify image can decode cleanly
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const testImg = new window.Image();
      testImg.onload = () => {
        onImageSelected(file, dataUrl);
      };
      testImg.onerror = () => {
        setErrorMessage(
          "Could not decode image data. The file appears to be corrupted or not a valid image."
        );
      };
      testImg.src = dataUrl;
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read file from disk.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        tabIndex={0}
        role="button"
        aria-label="Upload space photograph for accessibility review"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleBrowseClick();
          }
        }}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/70 scale-[1.01]"
            : "border-stone-300 hover:border-indigo-400 bg-stone-50/50 hover:bg-stone-50/90"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="w-16 h-16 mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-stone-900/5 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
          {isDragging ? (
            <UploadCloud className="w-8 h-8 text-indigo-600 animate-bounce" />
          ) : (
            <ImageIcon className="w-8 h-8 text-indigo-500" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-stone-900 mb-1">
          {isDragging ? "Drop your photo here" : "Upload an environment photograph"}
        </h3>
        <p className="text-sm text-stone-700 max-w-md mb-4 leading-relaxed">
          Drag and drop an image of an entrance, corridor, doorway, or stairwell, or click to browse.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-700">
          <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200">
            JPG, PNG, WebP
          </span>
          <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200">
            Up to 5 MB
          </span>
          <span className="px-2.5 py-1 bg-white rounded-md border border-stone-200">
            Single photograph
          </span>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Upload Error</p>
            <p className="text-rose-700 text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Demo Shortcut */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-100/90 rounded-xl text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 text-indigo-950 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Don&apos;t have a photo on hand?</span>
        </div>
        <button
          type="button"
          onClick={onUseDemo}
          className="px-3 py-1.5 font-medium text-xs text-indigo-700 bg-white hover:bg-indigo-50 active:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors"
        >
          Try Sample Entrance Photo
        </button>
      </div>
    </div>
  );
}
