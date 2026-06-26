import { api } from "./client";

export async function createEventRequest(payload) {
  return api.post("/events", payload);
}

export async function listEventsRequest({ status, page, limit } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/events${query}`);
}

export async function getEventRequest(eventId) {
  return api.get(`/events/${eventId}`);
}

export async function updateEventRequest(eventId, payload) {
  return api.put(`/events/${eventId}`, payload);
}

export async function publishEventRequest(eventId) {
  return api.post(`/events/${eventId}/publish`);
}

export async function startEventRequest(eventId) {
  return api.post(`/events/${eventId}/start`);
}

export async function endEventRequest(eventId) {
  return api.post(`/events/${eventId}/end`);
}

export async function deleteEventRequest(eventId) {
  return api.delete(`/events/${eventId}`);
}

export async function checkCapacityRequest(eventId) {
  return api.get(`/events/${eventId}/capacity`);
}

export async function getEventDashboardRequest(eventId) {
  return api.get(`/events/${eventId}/dashboard`);
}