import { api } from "./client";

export async function listGuestsRequest(eventId, { status, page, limit } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events/${eventId}/guests${query}`);
}

export async function addGuestRequest(eventId, guestData) {
  return api.post(`/events/${eventId}/guests`, guestData);
}

export async function deleteGuestRequest(eventId, guestId) {
  return api.delete(`/events/${eventId}/guests/${guestId}`);
}

export async function updateGuestRsvpRequest(eventId, guestId, status) {
  return api.put(`/events/${eventId}/guests/${guestId}/rsvp`, { status });
}

export async function getInvitationRequest(invitationIdOrToken) {
  return api.get(`/invitations/${invitationIdOrToken}`);
}

export async function submitRsvpRequest(invitationIdOrToken, status) {
  return api.post(`/invitations/${invitationIdOrToken}/rsvp`, { status });
}
