import { api } from "./client";

<<<<<<< HEAD
export async function listMediaRequest(eventId, { mediaType, page, limit } = {}) {
  const params = new URLSearchParams();
  if (mediaType) params.set("mediaType", mediaType);
=======
export async function listMediaRequest(eventId, { moment, page, limit } = {}) {
  const params = new URLSearchParams();
  if (moment) params.set("moment", moment);
>>>>>>> in
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events/${eventId}/media${query}`);
}

<<<<<<< HEAD
export async function getUploadUrlRequest(eventId) {
  return api.get(`/events/${eventId}/media/upload-url`);
}

export async function registerMediaRequest(eventId, mediaData) {
  return api.post(`/events/${eventId}/media`, mediaData);
}
=======
export async function uploadMediaRequest(eventId, file, { caption } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (caption) formData.append("caption", caption);
  return api.post(`/events/${eventId}/media`, formData, { isFormData: true });
}

export async function deleteMediaRequest(eventId, mediaId) {
  return api.delete(`/events/${eventId}/media/${mediaId}`);
}

export async function getTimelineRequest(eventId) {
  return api.get(`/events/${eventId}/media/timeline`);
}

export async function addVoiceNoteRequest(eventId, file, { message } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (message) formData.append("message", message);
  return api.post(`/events/${eventId}/voice-notes`, formData, { isFormData: true });
}

export async function listVoiceNotesRequest(eventId) {
  return api.get(`/events/${eventId}/voice-notes`);
}

export async function requestPrintAlbumRequest(eventId, payload) {
  return api.post(`/events/${eventId}/print-album`, payload);
}
>>>>>>> in
