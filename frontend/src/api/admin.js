import { api } from "./client";

export async function listTeamMembersRequest(eventId, { page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events/${eventId}/team${query}`);
}

export async function inviteTeamMemberRequest(eventId, { email, role }) {
  return api.post(`/events/${eventId}/team`, { email, role });
}

export async function updateTeamMemberRequest(eventId, memberId, payload) {
  return api.patch(`/events/${eventId}/team/${memberId}`, payload);
}

export async function removeTeamMemberRequest(eventId, memberId) {
  return api.delete(`/events/${eventId}/team/${memberId}`);
}

export async function getRoleStatsRequest(eventId) {
  return api.get(`/events/${eventId}/team/stats`);
}