export const buildUser = (overrides = {}) => ({
  id: "user-1",
  fullName: "Test User",
  email: "test@example.com",
  role: "HOST",
  avatarUrl: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

export const buildEvent = (overrides = {}) => ({
  id: "event-1",
  title: "Test Event",
  description: "A test event",
  status: "UPCOMING",
  startDate: new Date("2025-06-15"),
  endDate: new Date("2025-06-16"),
  hostId: "user-1",
  coverUrl: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

export const buildMedia = (overrides = {}) => ({
  id: "media-1",
  url: "https://res.cloudinary.com/test/image.jpg",
  publicId: "test/image",
  type: "IMAGE",
  status: "PENDING",
  eventId: "event-1",
  uploadedById: "user-1",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

export const buildComment = (overrides = {}) => ({
  id: "comment-1",
  content: "Nice photo!",
  mediaId: "media-1",
  authorId: "user-1",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  author: buildUser({ id: "user-1" }),
  ...overrides,
});

export const buildLike = (overrides = {}) => ({
  id: "like-1",
  mediaId: "media-1",
  userId: "user-1",
  createdAt: new Date("2025-01-01"),
  ...overrides,
});

export const buildNotification = (overrides = {}) => ({
  id: "notif-1",
  userId: "user-1",
  type: "CHECK_IN",
  title: "New check-in",
  body: "A guest checked in",
  isRead: false,
  eventId: "event-1",
  metadata: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  ...overrides,
});

export const buildInvitation = (overrides = {}) => ({
  id: "inv-1",
  eventId: "event-1",
  guestId: "guest-1",
  status: "PENDING",
  channel: "EMAIL",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  guest: { id: "guest-1", fullName: "Guest", email: "guest@test.com" },
  event: buildEvent(),
  ...overrides,
});

export const buildCheckIn = (overrides = {}) => ({
  id: "checkin-1",
  eventId: "event-1",
  guestId: "guest-1",
  qrCodeId: null,
  scannedByUserId: null,
  createdAt: new Date("2025-01-01"),
  guest: { id: "guest-1", fullName: "Guest" },
  ...overrides,
});

export const buildMemory = (overrides = {}) => ({
  id: "memory-1",
  eventId: "event-1",
  authorId: "user-1",
  type: "TEXT",
  content: "Beautiful wedding!",
  audioUrl: null,
  durationSecs: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  deletedAt: null,
  author: buildUser({ id: "user-1" }),
  ...overrides,
});
