import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const getSignedUploadParams = (options = {}) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: options.folder || "myguestly",
    ...options,
  };
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  return { ...params, signature, api_key: env.CLOUDINARY_API_KEY };
};

export default cloudinary;
