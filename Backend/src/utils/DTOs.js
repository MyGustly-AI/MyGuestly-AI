/**
 * Data Transfer Objects (DTOs)
 * Standardize data format for requests and responses
 */

// AUTH DTOs
export class LoginResponseDTO {
  constructor(user, accessToken, refreshToken) {
    this.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}

export class UserProfileDTO {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

// EVENT DTOs
export class EventCreateDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.location = data.location;
    this.maxGuests = data.maxGuests || 0;
  }
}

export class EventResponseDTO {
  constructor(event) {
    this.id = event.id;
    this.title = event.title;
    this.description = event.description;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.location = event.location;
    this.eventCode = event.eventCode;
    this.status = event.status;
    this.maxGuests = event.maxGuests;
    this.publishedAt = event.publishedAt || null;
    this.startedAt = event.startedAt || null;
    this.endedAt = event.endedAt || null;
    this.hostId = event.hostId;
    this.createdAt = event.createdAt;
    this.updatedAt = event.updatedAt;
    this.guestCount = event.guests?.length || 0;
    this.mediaCount = event.media?.length || 0;
  }
}

export class EventListItemDTO {
  constructor(event) {
    this.id = event.id;
    this.title = event.title;
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.location = event.location;
    this.eventCode = event.eventCode;
    this.guestCount = event.guests?.length || 0;
    this.rsvpCount =
      event.guests?.filter((g) => g.rsvpStatus === "CONFIRMED").length || 0;
  }
}

// GUEST DTOs
export class GuestInviteDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email || null;
    this.phone = data.phone || null;
  }
}

export class GuestResponseDTO {
  constructor(guest) {
    this.id = guest.id;
    this.name = guest.name;
    this.email = guest.email;
    this.phone = guest.phone;
    this.rsvpStatus = guest.rsvpStatus;
    this.checkedIn = guest.checkedIn;
    this.checkInTime = guest.checkInTime;
    this.qrToken = guest.qrToken; // Don't expose in production
    this.createdAt = guest.createdAt;
  }
}

export class GuestPublicResponseDTO {
  constructor(guest) {
    this.id = guest.id;
    this.name = guest.name;
    this.rsvpStatus = guest.rsvpStatus;
    this.checkedIn = guest.checkedIn;
    this.checkInTime = guest.checkInTime;
  }
}

// INVITATION DTOs
export class InvitationResponseDTO {
  constructor(guest, event) {
    this.guestId = guest.id;
    this.guestName = guest.name;
    this.eventId = event.id;
    this.eventTitle = event.title;
    this.eventStartDate = event.startDate;
    this.eventEndDate = event.endDate;
    this.location = event.location;
    this.qrToken = guest.qrToken;
    this.rsvpStatus = guest.rsvpStatus;
    this.eventCode = event.eventCode;
  }
}

// MEDIA DTOs
export class MediaUploadDTO {
  constructor(data) {
    this.mediaType = data.mediaType;
    this.url = data.url;
    this.caption = data.caption || null;
  }
}

export class MediaResponseDTO {
  constructor(media) {
    this.id = media.id;
    this.url = media.url;
    this.mediaType = media.mediaType;
    this.uploadedBy = media.uploadedBy;
    this.voiceNoteUrl = media.voiceNoteUrl;
    this.createdAt = media.createdAt;
  }
}

// MEMORY DTOs
export class MemoryCreateDTO {
  constructor(data) {
    this.content = data.content;
    this.type = data.type || "TEXT";
    this.mediaUrl = data.mediaUrl || null;
  }
}

export class MemoryResponseDTO {
  constructor(memory) {
    this.id = memory.id;
    this.content = memory.content;
    this.type = memory.type;
    this.mediaUrl = memory.mediaUrl;
    this.userName = memory.userName;
    this.createdAt = memory.createdAt;
  }
}

// QR CHECK-IN DTOs
export class CheckInResponseDTO {
  constructor(guest) {
    this.guestId = guest.id;
    this.guestName = guest.name;
    this.checkedIn = guest.checkedIn;
    this.checkInTime = guest.checkInTime;
    this.status = guest.checkedIn ? "CHECKED_IN" : "ALREADY_CHECKED_IN";
  }
}

export class CheckInSummaryDTO {
  constructor(event, checkedInCount, totalGuests) {
    this.eventId = event.id;
    this.eventTitle = event.title;
    this.totalGuests = totalGuests;
    this.checkedInCount = checkedInCount;
    this.pendingCount = totalGuests - checkedInCount;
    this.checkInPercentage = ((checkedInCount / totalGuests) * 100).toFixed(2);
  }
}

// PAGINATION DTOs
export class PaginationMetaDTO {
  constructor(page, limit, total) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class PaginatedResponseDTO {
  constructor(data, page, limit, total) {
    this.data = data;
    this.pagination = new PaginationMetaDTO(page, limit, total);
  }
}
