"use client";

import { useState } from "react";
import Image from "next/image";

import { uploadImageToIPFS, IPFSValidationError, IPFSUploadError } from "@/lib/ipfs";
import { validateImageUpload } from "@/lib/ipfs/validation";

interface ImageUploadProps {
    onImageUploaded: (ipfsHash: string) => void;
}

export default function ImageUpload({ onImageUploaded }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Pre-validate so the user sees the error before the round-trip.
        const validation = validateImageUpload(file);
        if (!validation.ok) {
            setError(validation.reason);
            e.target.value = "";
            return;
        }

        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            const { hash } = await uploadImageToIPFS(file);
            onImageUploaded(hash);
            setPreview(null);
            e.target.value = "";
        } catch (err: unknown) {
            const message =
                err instanceof IPFSValidationError || err instanceof IPFSUploadError
                    ? err.message
                    : err instanceof Error
                        ? err.message
                        : "Failed to upload image";
            setError(message);
            console.error("IPFS upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <div className="text-blue-600">Uploading to IPFS...</div>
                        ) : (
                            <>
                                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-500" role="alert">{error}</p>
            )}

            {preview && (
                <div className="mt-8 relative w-full aspect-video rounded-3xl overflow-hidden ring-1 ring-white/10 glass-card">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    );
}
