"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface User { id: string; fullName: string; role: string; cadre?: string; }
interface MessageItem {
  id: string; subject: string; body: string;
  sender: User; receiver: User;
  isReadByReceiver: boolean;
  fileUrl?: string | null; fileName?: string | null; fileSize?: number | null;
  screeningId?: string | null;
  createdAt: string; replyCount: number;
}
interface ReplyItem {
  id: string; body: string; sender: User;
  fileUrl?: string | null; fileName?: string | null;
  createdAt: string;
}
interface AnnouncementItem {
  id: string; title: string; body: string;
  author: { fullName: string; role: string };
  createdAt: string; isRead: boolean;
}

interface Props {
  currentUser: User;
  users: User[];
  initialInbox: MessageItem[];
  initialSent: MessageItem[];
  initialAnnouncements: AnnouncementItem[];
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "#1a5276", MANAGER: "#117a8b", SCREENER: "#198754",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span style={{
      fontSize: "0.6rem", fontWeight: 700, padding: "1px 7px",
      borderRadius: 20, color: "#fff",
      background: ROLE_COLOR[role] || "#6c757d",
      letterSpacing: "0.04em",
    }}>{role}</span>
  );
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function FileAttachment({ fileUrl, fileName, fileSize }: {
  fileUrl?: string | null; fileName?: string | null; fileSize?: number | null;
}) {
  if (!fileUrl || !fileName) return null;
  const size = fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : "";
  return (
    <a href={fileUrl} download={fileName}
      className="d-inline-flex align-items-center gap-2 mt-2 px-3 py-2 rounded text-decoration-none"
      style={{ background: "#f0f4f8", border: "1px solid #dee2e6", fontSize: "0.8rem", color: "#1a5276" }}>
      <span>📎</span>
      <span>{fileName}</span>
      {size && <span className="text-muted" style={{ fontSize: "0.7rem" }}>({size})</span>}
      <span style={{ fontSize: "0.7rem", color: "#117a8b" }}>⬇ Download</span>
    </a>
  );
}

export default function ChatClient({
  currentUser, users, initialInbox, initialSent, initialAnnouncements,
}: Props) {
  const [tab, setTab] = useState<"announcements" | "inbox" | "sent" | "compose">("announcements");
  const [inbox, setInbox] = useState(initialInbox);
  const [sent, setSent] = useState(initialSent);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [uploadingReply, setUploadingReply] = useState(false);

  // Compose
  const [composeReceiver, setComposeReceiver] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeScreeningId, setComposeScreeningId] = useState("");
  const [composeFile, setComposeFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");

  // Announcement compose
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [sendingAnn, setSendingAnn] = useState(false);
  const [annError, setAnnError] = useState("");
  const [showAnnCompose, setShowAnnCompose] = useState(false);

  const isManagerOrAdmin = currentUser.role === "MANAGER" || currentUser.role === "ADMIN";
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [replies, selectedMessage]);

  // Auto refresh every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [inboxRes, sentRes] = await Promise.all([
          fetch("/api/messages?type=inbox"),
          fetch("/api/messages?type=sent"),
        ]);
        const inboxData = await inboxRes.json();
        const sentData = await sentRes.json();
        if (inboxData.messages) setInbox(inboxData.messages.map((m: any) => ({
          ...m, createdAt: m.createdAt, replyCount: m.replies?.length || 0,
        })));
        if (sentData.messages) setSent(sentData.messages.map((m: any) => ({
          ...m, createdAt: m.createdAt, replyCount: m.replies?.length || 0,
        })));
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function openMessage(msg: MessageItem) {
    setSelectedMessage(msg);
    setLoadingThread(true);
    try {
      const otherId = msg.sender.id === currentUser.id ? msg.receiver.id : msg.sender.id;
      const res = await fetch(`/api/messages?with=${otherId}`);
      const data = await res.json();
      if (data.messages) {
        const allReplies: ReplyItem[] = [];
        data.messages.forEach((m: any) => {
          m.replies?.forEach((r: any) => allReplies.push(r));
        });
        setReplies(allReplies);
        // Mark as read locally
        setInbox(prev => prev.map(i => i.id === msg.id ? { ...i, isReadByReceiver: true } : i));
      }
    } catch {}
    setLoadingThread(false);
  }

  async function sendReply() {
    if (!selectedMessage || !replyBody.trim()) return;
    setSendingReply(true);
    let fileUrl = null, fileName = null, fileSize = null;
    if (replyFile) {
      setUploadingReply(true);
      const fd = new FormData();
      fd.append("file", replyFile);
      const up = await fetch("/api/messages/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (upData.ok) { fileUrl = upData.fileUrl; fileName = upData.fileName; fileSize = upData.fileSize; }
      setUploadingReply(false);
    }
    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessage.id, body: replyBody, fileUrl, fileName, fileSize }),
      });
      const data = await res.json();
      if (data.ok) {
        setReplies(prev => [...prev, data.reply]);
        setReplyBody("");
        setReplyFile(null);
      }
    } catch {}
    setSendingReply(false);
  }

  async function sendMessage() {
    setSending(true); setComposeError(""); setComposeSuccess("");
    let fileUrl = null, fileName = null, fileSize = null;
    if (composeFile) {
      const fd = new FormData();
      fd.append("file", composeFile);
      const up = await fetch("/api/messages/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) { setComposeError(upData.error || "File upload failed"); setSending(false); return; }
      fileUrl = upData.fileUrl; fileName = upData.fileName; fileSize = upData.fileSize;
    }
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: composeReceiver,
          subject: composeSubject,
          body: composeBody,
          screeningId: composeScreeningId || null,
          fileUrl, fileName, fileSize,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setComposeError(data.error || "Failed to send"); }
      else {
        setComposeSuccess("Message sent successfully!");
        setComposeReceiver(""); setComposeSubject("");
        setComposeBody(""); setComposeScreeningId(""); setComposeFile(null);
        setSent(prev => [{ ...data.message, createdAt: data.message.createdAt, replyCount: 0 }, ...prev]);
        setTimeout(() => { setComposeSuccess(""); setTab("sent"); }, 1500);
      }
    } catch { setComposeError("Network error"); }
    setSending(false);
  }

  async function postAnnouncement() {
    setSendingAnn(true); setAnnError("");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: annTitle, annBody }),
      });
      const data = await res.json();
      if (!res.ok) { setAnnError(data.error || "Failed to post"); }
      else {
        setAnnouncements(prev => [{ ...data.announcement, createdAt: data.announcement.createdAt, isRead: true }, ...prev]);
        setAnnTitle(""); setAnnBody(""); setShowAnnCompose(false);
      }
    } catch { setAnnError("Network error"); }
    setSendingAnn(false);
  }

  const unreadInbox = inbox.filter(m => !m.isReadByReceiver).length;
  const unreadAnn = announcements.filter(a => !a.isRead).length;

  // If message selected, show thread view
  if (selectedMessage) {
    const other = selectedMessage.sender.id === currentUser.id
      ? selectedMessage.receiver : selectedMessage.sender;
    return (
      <div className="d-flex flex-column" style={{ height: "100vh", maxHeight: "100vh" }}>
        {/* Thread header */}
        <div className="d-flex align-items-center gap-3 px-3 px-md-4 py-3"
          style={{ background: "#1a5276", color: "#fff", flexShrink: 0 }}>
          <button onClick={() => { setSelectedMessage(null); setReplies([]); }}
            style={{ background: "none", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer" }}>
            ←
          </button>
          <div>
            <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{selectedMessage.subject}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
              Conversation with {other.fullName} · <RoleBadge role={other.role} />
            </div>
          </div>
        </div>

        {/* Thread messages */}
        <div ref={threadRef} className="flex-grow-1 overflow-auto p-3 p-md-4"
          style={{ background: "#f8f9fa" }}>
          {loadingThread ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" style={{ color: "#1a5276" }} />
            </div>
          ) : (
            <>
              {/* Original message */}
              <div className={`d-flex mb-3 ${selectedMessage.sender.id === currentUser.id ? "justify-content-end" : "justify-content-start"}`}>
                <div style={{
                  maxWidth: "75%", borderRadius: 16,
                  borderBottomRightRadius: selectedMessage.sender.id === currentUser.id ? 4 : 16,
                  borderBottomLeftRadius: selectedMessage.sender.id === currentUser.id ? 16 : 4,
                  background: selectedMessage.sender.id === currentUser.id ? "#1a5276" : "#fff",
                  color: selectedMessage.sender.id === currentUser.id ? "#fff" : "#212529",
                  padding: "12px 16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                  <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 4 }}>
                    {selectedMessage.sender.fullName} · {timeAgo(selectedMessage.createdAt)}
                  </div>
                  <div style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{selectedMessage.body}</div>
                  {selectedMessage.screeningId && (
                    <Link href={`/screenings/${selectedMessage.screeningId}`}
                      className="d-inline-block mt-2"
                      style={{ fontSize: "0.75rem", color: selectedMessage.sender.id === currentUser.id ? "#90caf9" : "#1a5276" }}>
                      🔗 View linked screening
                    </Link>
                  )}
                  <FileAttachment fileUrl={selectedMessage.fileUrl} fileName={selectedMessage.fileName} fileSize={selectedMessage.fileSize} />
                </div>
              </div>

              {/* Replies */}
              {replies.map(r => (
                <div key={r.id} className={`d-flex mb-3 ${r.sender.id === currentUser.id ? "justify-content-end" : "justify-content-start"}`}>
                  <div style={{
                    maxWidth: "75%", borderRadius: 16,
                    borderBottomRightRadius: r.sender.id === currentUser.id ? 4 : 16,
                    borderBottomLeftRadius: r.sender.id === currentUser.id ? 16 : 4,
                    background: r.sender.id === currentUser.id ? "#1a5276" : "#fff",
                    color: r.sender.id === currentUser.id ? "#fff" : "#212529",
                    padding: "12px 16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}>
                    <div style={{ fontSize: "0.7rem", opacity: 0.7, marginBottom: 4 }}>
                      {r.sender.fullName} · {timeAgo(r.createdAt)}
                    </div>
                    <div style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{r.body}</div>
                    <FileAttachment fileUrl={r.fileUrl} fileName={r.fileName} fileSize={r.fileSize} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Reply box */}
        <div className="p-3 p-md-4" style={{ background: "#fff", borderTop: "1px solid #dee2e6", flexShrink: 0 }}>
          {replyFile && (
            <div className="d-flex align-items-center gap-2 mb-2 small text-muted">
              <span>📎 {replyFile.name}</span>
              <button onClick={() => setReplyFile(null)}
                style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer" }}>✕</button>
            </div>
          )}
          <div className="d-flex gap-2 align-items-end">
            <label className="btn btn-sm btn-outline-secondary flex-shrink-0" title="Attach file">
              📎
              <input type="file" hidden onChange={e => setReplyFile(e.target.files?.[0] || null)} />
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={2}
              placeholder="Type a reply..."
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              style={{ resize: "none", borderRadius: 12 }}
            />
            <button className="btn btn-sm text-white flex-shrink-0"
              style={{ background: "#1a5276", borderRadius: 12 }}
              onClick={sendReply}
              disabled={sendingReply || uploadingReply || !replyBody.trim()}>
              {sendingReply ? <span className="spinner-border spinner-border-sm" /> : "➤"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="px-3 px-md-4 py-3 mt-5 mt-md-0"
        style={{ background: "#1a5276", color: "#fff", flexShrink: 0 }}>
        <h1 className="h5 fw-bold mb-0">💬 Messages</h1>
        <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
          Internal communication — OGH SCD E-Tracker
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex border-bottom bg-white px-2" style={{ flexShrink: 0, overflowX: "auto" }}>
        {[
          { key: "announcements", label: "📢 Announcements", badge: unreadAnn },
          { key: "inbox", label: "📥 Inbox", badge: unreadInbox },
          { key: "sent", label: "📤 Sent", badge: 0 },
          { key: "compose", label: "✏️ Compose", badge: 0 },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              background: "none", border: "none", borderBottom: tab === t.key ? "3px solid #1a5276" : "3px solid transparent",
              color: tab === t.key ? "#1a5276" : "#666",
              fontWeight: tab === t.key ? 700 : 400,
              padding: "12px 16px", cursor: "pointer", fontSize: "0.82rem",
              whiteSpace: "nowrap", position: "relative",
            }}>
            {t.label}
            {t.badge > 0 && (
              <span className="ms-1 badge rounded-pill"
                style={{ background: "#dc3545", fontSize: "0.6rem" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto p-3 p-md-4 pb-5 mb-5 pb-md-4 mb-md-0">

        {/* Announcements */}
        {tab === "announcements" && (
          <div>
            {isManagerOrAdmin && (
              <div className="mb-3">
                {!showAnnCompose ? (
                  <button className="btn btn-sm text-white"
                    style={{ background: "#1a5276" }}
                    onClick={() => setShowAnnCompose(true)}>
                    📢 Post Announcement
                  </button>
                ) : (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-header fw-semibold py-2"
                      style={{ background: "#1a5276", color: "#fff", fontSize: "0.85rem" }}>
                      📢 New Announcement
                    </div>
                    <div className="card-body p-3">
                      {annError && <div className="alert alert-danger small">{annError}</div>}
                      <div className="mb-2">
                        <input className="form-control form-control-sm mb-2"
                          placeholder="Title *"
                          value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
                        <textarea className="form-control form-control-sm" rows={3}
                          placeholder="Message to all staff..."
                          value={annBody} onChange={e => setAnnBody(e.target.value)} />
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm text-white"
                          style={{ background: "#1a5276" }}
                          onClick={postAnnouncement} disabled={sendingAnn || !annTitle.trim() || !annBody.trim()}>
                          {sendingAnn ? <><span className="spinner-border spinner-border-sm me-1" />Posting...</> : "Post"}
                        </button>
                        <button className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowAnnCompose(false)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {announcements.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: "2.5rem" }}>📢</div>
                <div className="mt-2">No announcements yet</div>
              </div>
            ) : announcements.map(a => (
              <div key={a.id} className="card border-0 shadow-sm mb-3"
                style={{ borderLeft: a.isRead ? "4px solid #dee2e6" : "4px solid #1a5276" }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h6 className="fw-bold mb-0" style={{ color: "#1a5276" }}>{a.title}</h6>
                    {!a.isRead && <span className="badge" style={{ background: "#1a5276", fontSize: "0.6rem" }}>NEW</span>}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.7rem", marginBottom: 8 }}>
                    {a.author.fullName} · <RoleBadge role={a.author.role} /> · {timeAgo(a.createdAt)}
                  </div>
                  <div style={{ fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>{a.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inbox */}
        {tab === "inbox" && (
          <div>
            {inbox.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: "2.5rem" }}>📥</div>
                <div className="mt-2">Your inbox is empty</div>
              </div>
            ) : inbox.map(m => (
              <div key={m.id}
                className="card border-0 shadow-sm mb-2"
                style={{
                  cursor: "pointer",
                  borderLeft: m.isReadByReceiver ? "4px solid #dee2e6" : "4px solid #1a5276",
                }}
                onClick={() => openMessage(m)}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                          {m.sender.fullName}
                        </span>
                        <RoleBadge role={m.sender.role} />
                        {!m.isReadByReceiver && (
                          <span className="badge rounded-pill"
                            style={{ background: "#1a5276", fontSize: "0.55rem" }}>NEW</span>
                        )}
                      </div>
                      <div className="fw-bold small">{m.subject}</div>
                      <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {m.body.substring(0, 80)}{m.body.length > 80 ? "..." : ""}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>{timeAgo(m.createdAt)}</div>
                      {m.replyCount > 0 && (
                        <div className="text-muted" style={{ fontSize: "0.68rem" }}>💬 {m.replyCount}</div>
                      )}
                      {m.fileName && <div style={{ fontSize: "0.68rem" }}>📎</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sent */}
        {tab === "sent" && (
          <div>
            {sent.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: "2.5rem" }}>📤</div>
                <div className="mt-2">No sent messages</div>
              </div>
            ) : sent.map(m => (
              <div key={m.id}
                className="card border-0 shadow-sm mb-2"
                style={{ cursor: "pointer", borderLeft: "4px solid #dee2e6" }}
                onClick={() => openMessage(m)}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-2">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-muted" style={{ fontSize: "0.78rem" }}>To:</span>
                        <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                          {m.receiver.fullName}
                        </span>
                        <RoleBadge role={m.receiver.role} />
                      </div>
                      <div className="fw-bold small">{m.subject}</div>
                      <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                        {m.body.substring(0, 80)}{m.body.length > 80 ? "..." : ""}
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>{timeAgo(m.createdAt)}</div>
                      {m.isReadByReceiver
                        ? <div style={{ fontSize: "0.65rem", color: "#198754" }}>✓✓ Read</div>
                        : <div style={{ fontSize: "0.65rem", color: "#aaa" }}>✓ Sent</div>}
                      {m.fileName && <div style={{ fontSize: "0.68rem" }}>📎</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compose */}
        {tab === "compose" && (
          <div className="card border-0 shadow-sm" style={{ maxWidth: 640 }}>
            <div className="card-header fw-semibold py-2"
              style={{ background: "#1a5276", color: "#fff", fontSize: "0.85rem" }}>
              ✏️ New Message
            </div>
            <div className="card-body p-4">
              {composeError && <div className="alert alert-danger small">{composeError}</div>}
              {composeSuccess && <div className="alert alert-success small">{composeSuccess}</div>}
              <div className="mb-3">
                <label className="form-label small fw-semibold">To *</label>
                <select className="form-select form-select-sm"
                  value={composeReceiver} onChange={e => setComposeReceiver(e.target.value)}>
                  <option value="">Select recipient...</option>
                  {["ADMIN", "MANAGER", "SCREENER"].map(role => {
                    const group = users.filter(u => u.role === role);
                    if (group.length === 0) return null;
                    return (
                      <optgroup key={role} label={role}>
                        {group.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} — {u.cadre || role}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Subject *</label>
                <input className="form-control form-control-sm"
                  placeholder="e.g. Question about patient OGH-2026-001"
                  value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Message *</label>
                <textarea className="form-control form-control-sm" rows={5}
                  placeholder="Type your message..."
                  value={composeBody} onChange={e => setComposeBody(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Link to Screening <span className="text-muted fw-normal">(optional)</span>
                </label>
                <input className="form-control form-control-sm"
                  placeholder="Paste screening ID e.g. cm1abc123..."
                  value={composeScreeningId} onChange={e => setComposeScreeningId(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Attach File <span className="text-muted fw-normal">(optional, max 5MB)</span>
                </label>
                <input type="file" className="form-control form-control-sm"
                  onChange={e => setComposeFile(e.target.files?.[0] || null)} />
                {composeFile && (
                  <div className="small text-muted mt-1">
                    📎 {composeFile.name} ({(composeFile.size / 1024).toFixed(1)} KB)
                    <button onClick={() => setComposeFile(null)}
                      style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", marginLeft: 8 }}>
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm text-white px-4"
                  style={{ background: "#1a5276" }}
                  onClick={sendMessage}
                  disabled={sending || !composeReceiver || !composeSubject.trim() || !composeBody.trim()}>
                  {sending ? <><span className="spinner-border spinner-border-sm me-1" />Sending...</> : "📤 Send Message"}
                </button>
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => { setComposeReceiver(""); setComposeSubject(""); setComposeBody(""); setComposeFile(null); setComposeError(""); }}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
