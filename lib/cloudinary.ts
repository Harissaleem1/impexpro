import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export type MediaResourceType = "image" | "video";
export type MediaFolder = "impexpro/blogs" | "impexpro/activities" | "impexpro/general";

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]);
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const VIDEO_MAX_BYTES = 80 * 1024 * 1024;

function readCloudinaryEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function getCloudinaryConfig() {
  const cloudName = readCloudinaryEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readCloudinaryEnv("CLOUDINARY_API_KEY");
  const apiSecret = readCloudinaryEnv("CLOUDINARY_API_SECRET");
  const missing = [
    ["CLOUDINARY_CLOUD_NAME", cloudName],
    ["CLOUDINARY_API_KEY", apiKey],
    ["CLOUDINARY_API_SECRET", apiSecret]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    return {
      ok: false as const,
      error: `Missing Cloudinary environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`
    };
  }

  return { ok: true as const, cloudName, apiKey, apiSecret };
}

export function validateMediaFile(file: File, resourceType: MediaResourceType) {
  const allowedTypes = resourceType === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const maxBytes = resourceType === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;

  if (!allowedTypes.has(file.type)) {
    return {
      ok: false as const,
      error:
        resourceType === "image"
          ? "Unsupported image type. Upload JPG, PNG, or WebP."
          : "Unsupported video type. Upload MP4, MOV, WebM, or AVI."
    };
  }

  if (file.size > maxBytes) {
    return {
      ok: false as const,
      error: `${resourceType === "image" ? "Image" : "Video"} is too large. Maximum size is ${
        resourceType === "image" ? "8MB" : "80MB"
      }.`
    };
  }

  return { ok: true as const };
}

export async function uploadToCloudinary(
  file: File,
  options: { folder: MediaFolder; resourceType: MediaResourceType }
) {
  const config = getCloudinaryConfig();
  if (!config.ok) return config;

  const validation = validateMediaFile(file, options.resourceType);
  if (!validation.ok) return validation;

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });

  return {
    ok: true as const,
    url: upload.secure_url,
    publicId: upload.public_id,
    resourceType: upload.resource_type
  };
}
