"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Upload, X, Loader2 } from "lucide-react";
import { optimizeImageForUpload } from "@/lib/image-optimization";
import type { GenericImagePresignInput } from "@nice-land/contracts";

type ImageUploadMode = "url" | "upload";

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: GenericImagePresignInput["folder"];
  presignGenericImage: (input: GenericImagePresignInput) => Promise<{
    uploadUrl: string;
    objectKey: string;
    publicUrl: string;
    expiresIn: number;
    headers: Record<string, string>;
  }>;
  wide?: boolean;
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  folder,
  presignGenericImage,
  wide = false,
}: ImageUploadInputProps) {
  const [mode, setMode] = useState<ImageUploadMode>(value ? "url" : "url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const optimized = await optimizeImageForUpload(file);

      const presigned = await presignGenericImage({
        fileName: optimized.name,
        mimeType: optimized.type as GenericImagePresignInput["mimeType"],
        size: optimized.size,
        folder,
      });

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        body: optimized,
        headers: presigned.headers,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload lên S3 thất bại.");
      }

      setImgError(false);
      onChange(presigned.publicUrl);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Không thể tải ảnh lên.",
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleClear() {
    onChange("");
    setError("");
    setImgError(false);
  }

  return (
    <div
      className={`grid gap-2 text-sm font-bold text-ink/80 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex gap-1 rounded-lg bg-ink/5 p-0.5">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
              mode === "url"
                ? "bg-white text-ink shadow-sm"
                : "text-ink/40 hover:text-ink/60"
            }`}
          >
            <Link2 size={12} />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
              mode === "upload"
                ? "bg-white text-ink shadow-sm"
                : "text-ink/40 hover:text-ink/60"
            }`}
          >
            <Upload size={12} />
            Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setError("");
            setImgError(false);
          }}
          placeholder="https://example.com/image.jpg"
          className="h-12 min-w-0 rounded-xl border border-ink/5 bg-white/50 px-4 font-normal backdrop-blur-sm transition-colors focus:bg-white"
        />
      ) : (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${folder}-${label.replace(/\s+/g, "-")}`}
          />
          <label
            htmlFor={`file-upload-${folder}-${label.replace(/\s+/g, "-")}`}
            className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/15 bg-white/50 px-4 font-normal transition-colors hover:border-ink/30 hover:bg-white ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin text-moss" />
                <span className="text-ink/50">Đang tối ưu & tải lên...</span>
              </>
            ) : (
              <>
                <ImagePlus size={18} className="text-ink/30" />
                <span className="text-ink/50">
                  Chọn ảnh từ máy (JPG, PNG, WebP)
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600">{error}</p>
      )}

      {value && !imgError && (
        <div className="group relative mt-1 overflow-hidden rounded-xl border border-ink/10">
          <img
            key={value}
            src={value}
            alt={label}
            className="h-20 w-full object-cover"
            onError={() => setImgError(true)}
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Xóa ảnh"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
