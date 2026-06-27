import { api } from "./client";

export async function listGuestsRequest(eventId, { status, page, limit } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events/${eventId}/guests${query}`);
}

export async function addGuestRequest(eventId, { fullName, email, phone }) {
  return api.post(`/events/${eventId}/guests`, { fullName, email, phone });
}

export async function importGuestsRequest(eventId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/events/${eventId}/guests/import`, formData, {
    headers: {},
    isFormData: true,
  });
}

export async function updateGuestRequest(eventId, guestId, payload) {
  return api.patch(`/events/${eventId}/guests/${guestId}`, payload);
}

export async function deleteGuestRequest(eventId, guestId) {
  return api.delete(`/events/${eventId}/guests/${guestId}`);
}

export async function sendInviteRequest(eventId, guestId) {
  return api.post(`/events/${eventId}/guests/${guestId}/invite`);
}

export async function sendAllInvitesRequest(eventId) {
  return api.post(`/events/${eventId}/guests/invite-all`);
}

export async function rsvpRequest(eventId, guestId, { status }) {
  return api.patch(`/events/${eventId}/guests/${guestId}/rsvp`, { status });
}

export async function checkInGuestRequest(eventId, { qrCode }) {
  return api.post(`/events/${eventId}/checkin`, { qrCode });
}
export const updateGuestRsvpRequest = (eventId, guestId, status) =>
  api.patch(`/events/${eventId}/guests/${guestId}/rsvp`, { status });

export const checkinGuestRequest = (eventId, qrCode) =>
  api.post(`/events/${eventId}/checkin`, { qrCode });