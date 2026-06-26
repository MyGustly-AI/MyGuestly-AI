import { api } from "./client";

export async function listMediaRequest(eventId, { mediaType, page, limit } = {}) {
  const params = new URLSearchParams();
  if (mediaType) params.set("mediaType", mediaType);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events/${eventId}/media${query}`);
}

export async function getUploadUrlRequest(eventId) {
  return api.get(`/events/${eventId}/media/upload-url`);
}

export async function registerMediaRequest(eventId, mediaData) {
  return api.post(`/events/${eventId}/media`, mediaData);
}
