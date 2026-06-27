import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../api/components/Sidebar";
import { listTeamMembersRequest, inviteTeamMemberRequest, getRoleStatsRequest } from "../api/admin";
import "./AdminRolesPage.css";

const roleHierarchy = [
  {
    title: "Full Admin",
    icon: <ShieldIcon />,
    color: "#7C3AED",
    perms: [
      "Total control over event settings",
      "Manage guest lists and RSVPs",
      "Access financial reports & billing",
      "Invite and manage other admins",
    ],
  },
  {
    title: "Check-in Lead",
    icon: <ScanIcon />,
    color: "#2563EB",
    perms: [
      "Real-time guest entry management",
      "Scan QR codes for guest check-in",
      "View guest contact details",
      "Access entrance occupancy logs",
    ],
  },
  {
    title: "Gallery Moderator",
    icon: <GalleryIcon />,
    color: "#16a34a",
    perms: [
      "Approve/delete shared uploads",
      "Manage public comment sections",
      "Orient & filter guest voice notes",
      "Flag disruptive guest content",
    ],
  },
];

export default function AdminRolesPage() {
  const location = useLocation();
  const eventId = location.state?.eventId;

  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("CHECK-IN LEAD");
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  const loadTeam = async () => {
    if (!eventId) return;
    try {
      const [teamResult, statsResult] = await Promise.all([
        listTeamMembersRequest(eventId, { limit: 10 }),
        getRoleStatsRequest(eventId).catch(() => null),
      ]);
      const list = teamResult?.data ?? teamResult?.team ?? teamResult ?? [];
      setAdmins(Array.isArray(list) ? list : []);
      setStats(statsResult?.data ?? statsResult ?? null);
    } catch (err) {
      setError(err.message || "Could not load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError("No event selected. Open this page from an event to manage its team.");
      return;
    }
    loadTeam();
  }, [eventId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    setInviting(true);
    try {
      await inviteTeamMemberRequest(eventId, { email: inviteEmail, role: inviteRole });
      setInviteEmail("");
      setShowInvite(false);
      await loadTeam();
    } catch (err) {
      setInviteError(err.message || "Could not send invite.");
    } finally {
      setInviting(false);
    }
  };

  const fullAdminCount = stats?.fullAdmins ?? admins.filter((a) => a.role === "FULL ADMIN").length;
  const checkInCount = stats?.checkInStaff ?? admins.filter((a) => a.role === "CHECK-IN LEAD").length;
  const moderatorCount = stats?.moderators ?? admins.filter((a) => a.role === "GALLERY MODERATOR").length;

  return (
    <div className="app-layout">
      <Sidebar role="host" />
      <main className="main-content">
        <div className="page-inner admin-outer">
          <div className="admin-page-header">
            <div className="admin-breadcrumb">Organisation / Settings</div>
            <div className="admin-page-header-row">
              <div>
                <h1 className="page-heading">Admin Roles & Permissions</h1>
                <p className="page-sub">Delegate responsibilities and manage team access for your events.</p>
              </div>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowInvite(true)} disabled={!eventId}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Add New Admin
              </button>
            </div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

          {showInvite && (
            <div className="card" style={{ marginBottom: 24, padding: 20 }}>
              <h3 className="inv-section-title" style={{ marginBottom: 12 }}>Invite Team Member</h3>
              {inviteError && <div className="auth-error" style={{ marginBottom: 10 }}>{inviteError}</div>}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="label">Email</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="teammate@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ minWidth: 180 }}>
                  <label className="label">Role</label>
                  <select className="input-field" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                    <option value="FULL ADMIN">Full Admin</option>
                    <option value="CHECK-IN LEAD">Check-in Lead</option>
                    <option value="GALLERY MODERATOR">Gallery Moderator</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={handleInvite} disabled={inviting}>
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
                <button className="btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#ede9fe", color: "var(--primary)" }}><ShieldIcon /></div>
              <div>
                <div className="admin-stat-val">{loading ? "—" : String(fullAdminCount).padStart(2, "0")}</div>
                <div className="admin-stat-label">Full Admins</div>
                <div className="admin-stat-sub">Total control & billing</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#dbeafe", color: "#2563eb" }}><ScanIcon /></div>
              <div>
                <div className="admin-stat-val">{loading ? "—" : String(checkInCount).padStart(2, "0")}</div>
                <div className="admin-stat-label">Check-In Staff</div>
                <div className="admin-stat-sub">Entry & QR management</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: "#dcfce7", color: "#16a34a" }}><GalleryIcon /></div>
              <div>
                <div className="admin-stat-val">{loading ? "—" : String(moderatorCount).padStart(2, "0")}</div>
                <div className="admin-stat-label">Moderators</div>
                <div className="admin-stat-sub">Content & gallery approval</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
              <h3 className="inv-section-title" style={{ margin: 0 }}>Active Team Members</h3>
              <div className="input-icon-wrap" style={{ width: 220 }}>
                <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="input-field input-with-icon" placeholder="Search team..." style={{ padding: "8px 8px 8px 34px", fontSize: 12 }} />
              </div>
            </div>
            <table className="guest-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Role</th>
                  <th>Permissions Classes</th>
                  <th>Assigned Events</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} style={{ padding: 20, color: "var(--text-light)" }}>Loading team...</td></tr>
                )}
                {!loading && admins.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 20, color: "var(--text-light)" }}>No team members yet.</td></tr>
                )}
                {!loading &&
                  admins.map((a, i) => (
                    <tr key={a.id || i}>
                      <td>
                        <div className="guest-cell">
                          <div className="guest-avatar-sm">
                            {(a.name || a.fullName || "?")
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="guest-name">{a.name || a.fullName}</div>
                            <div className="guest-email">{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${a.role === "FULL ADMIN" ? "badge-purple" : a.role === "CHECK-IN LEAD" ? "badge-info" : "badge-success"}`}>
                          {a.role}
                        </span>
                      </td>
                      <td className="guest-email">{a.perms || a.permissions}</td>
                      <td className="guest-email">{a.event || a.events}</td>
                      <td>
                        <div className="guest-actions">
                          <button className="table-action-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="table-action-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="table-footer">
              <span>Showing {admins.length} team member{admins.length === 1 ? "" : "s"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="page-btn">Previous</button>
                <button className="page-btn active">Next</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="inv-section-title" style={{ marginBottom: 4 }}>Role Hierarchy & Access Levels</h3>
            <p className="page-sub" style={{ marginBottom: 20, fontSize: 12 }}>Understand the specific capabilities of each administrative level.</p>
            <div className="role-hierarchy-grid">
              {roleHierarchy.map((r, i) => (
                <div key={i} className="role-card">
                  <div className="role-card-header">
                    <div className="role-card-icon" style={{ background: r.color + "20", color: r.color }}>{r.icon}</div>
                    <span className="role-card-title">{r.title}</span>
                  </div>
                  <ul className="role-perm-list">
                    {r.perms.map((p, j) => (
                      <li key={j} className="role-perm-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-light)" }}>
            MyGuestly AI Admin Portal
          </div>
        </div>
      </main>
    </div>
  );
}

function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function ScanIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>; }
function GalleryIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>; }