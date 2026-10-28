import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadOriginal(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "lattice", public_id: publicId, resource_type: "raw" },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.public_id) return reject(new Error("Cloudinary did not return an uploaded file"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function deleteOriginal(publicId) {
  if (!publicId) return;
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary file deletion failed: ${result.result}`);
  }
}
