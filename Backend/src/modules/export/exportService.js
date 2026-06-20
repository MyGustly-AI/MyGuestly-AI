function escapeCsv(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows, headers) {
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h] ?? "")).join(","));
  }
  return lines.join("\n");
}

export class ExportService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async exportGuests(eventId) {
    const guests = await this.prisma.guest.findMany({
      where: { eventId, deletedAt: null },
      include: { invitation: true, checkIn: true },
      orderBy: { createdAt: "asc" },
    });

    const rows = guests.map((g) => ({
      id: g.id,
      fullName: g.fullName,
      email: g.email || "",
      phone: g.phone || "",
      rsvpStatus: g.invitation?.status || "NO_INVITATION",
      rsvpAt: g.invitation?.rsvpAt ? g.invitation.rsvpAt.toISOString() : "",
      sentAt: g.invitation?.sentAt ? g.invitation.sentAt.toISOString() : "",
      checkedIn: g.checkIn ? "YES" : "NO",
      checkedAt: g.checkIn?.checkedAt ? g.checkIn.checkedAt.toISOString() : "",
    }));

    const csv = toCsv(rows, ["id", "fullName", "email", "phone", "rsvpStatus", "rsvpAt", "sentAt", "checkedIn", "checkedAt"]);
    return { csv, filename: `guests-${eventId}.csv` };
  }

  async exportCheckIns(eventId) {
    const checkIns = await this.prisma.checkIn.findMany({
      where: { eventId },
      include: { guest: true },
      orderBy: { checkedAt: "asc" },
    });

    const rows = checkIns.map((c) => ({
      id: c.id,
      guestId: c.guestId,
      fullName: c.guest?.fullName || "",
      email: c.guest?.email || "",
      phone: c.guest?.phone || "",
      checkedAt: c.checkedAt.toISOString(),
    }));

    const csv = toCsv(rows, ["id", "guestId", "fullName", "email", "phone", "checkedAt"]);
    return { csv, filename: `checkins-${eventId}.csv` };
  }
}
