import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 3000);
const adminKey = process.env.ADMIN_KEY || "dev-admin-key";
const users = new Map();
const workspaces = new Map();
const webhookEvents = [];

const registerSchema = z.object({
  email: z.string().email().max(254),
  phoneNumberId: z.string().trim().min(5).max(64),
  whatsappToken: z.string().trim().min(10).max(4096),
  wabaId: z.string().trim().min(5).max(64),
  plan: z.enum(["free", "pro"]).default("free")
});

const sendSchema = z.object({
  to: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),
  body: z.string().trim().min(1).max(4096)
});

app.use(helmet());
app.use(express.json({ limit: "32kb" }));
app.use(express.static("public"));

function id() {
  return `usr_${crypto.randomBytes(12).toString("hex")}`;
}

function sessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function userView(user) {
  return {
    userId: user.userId,
    email: user.email,
    plan: user.plan,
    quota: user.quota,
    sent: user.sent,
    remaining: user.quota - user.sent,
    createdAt: user.createdAt
  };
}

function requireUser(req, res, next) {
  const userId = req.get("x-user-id");
  const token = req.get("x-session-token");
  const user = users.get(userId);
  if (!user || !token || token !== user.sessionToken) {
    return res.status(401).json({ error: "Autentikasi diperlukan." });
  }
  req.user = user;
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "wa-workspace", mode: "development" });
});

app.post("/api/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Data registrasi tidak valid." });
  const { email, phoneNumberId, whatsappToken, wabaId, plan } = parsed.data;
  if ([...users.values()].some((user) => user.email === email)) {
    return res.status(409).json({ error: "Email sudah terdaftar." });
  }
  const user = {
    userId: id(),
    email,
    phoneNumberId,
    wabaId,
    // Demo only: token lives in memory and is never returned or logged.
    whatsappToken,
    plan,
    quota: plan === "pro" ? 10000 : 1000,
    sent: 0,
    sessionToken: sessionToken(),
    createdAt: new Date().toISOString()
  };
  users.set(user.userId, user);
  const workspace = { workspaceId: `ws_${crypto.randomBytes(10).toString("hex")}`, name: `${email.split("@")[0]}'s Workspace`, ownerId: user.userId, members: new Map([[user.userId, "owner"]]), createdAt: new Date().toISOString() };
  workspaces.set(workspace.workspaceId, workspace);
  return res.status(201).json({ userId: user.userId, sessionToken: user.sessionToken, workspaceId: workspace.workspaceId, user: userView(user) });
});

app.post("/api/login", (req, res) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: "User tidak ditemukan." });
  user.sessionToken = sessionToken();
  return res.json({ userId: user.userId, sessionToken: user.sessionToken, user: userView(user) });
});

app.get("/api/me", requireUser, (req, res) => res.json({ user: userView(req.user) }));

app.get("/api/workspaces", requireUser, (_req, res) => {
  const owned = [...workspaces.values()].filter((workspace) => workspace.members.has(_req.user.userId)).map((workspace) => ({ workspaceId: workspace.workspaceId, name: workspace.name, role: workspace.members.get(_req.user.userId), memberCount: workspace.members.size, createdAt: workspace.createdAt }));
  res.json({ workspaces: owned });
});

app.post("/api/workspaces", requireUser, (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 80) : "";
  if (name.length < 2) return res.status(400).json({ error: "Nama workspace minimal 2 karakter." });
  const workspace = { workspaceId: `ws_${crypto.randomBytes(10).toString("hex")}`, name, ownerId: req.user.userId, members: new Map([[req.user.userId, "owner"]]), createdAt: new Date().toISOString() };
  workspaces.set(workspace.workspaceId, workspace);
  res.status(201).json({ workspace: { workspaceId: workspace.workspaceId, name: workspace.name, role: "owner", memberCount: 1, createdAt: workspace.createdAt } });
});

app.post("/api/send", requireUser, async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Nomor tujuan atau isi pesan tidak valid." });
  if (!process.env.WHATSAPP_TOKEN || !req.user.phoneNumberId) return res.status(503).json({ error: "Integrasi WhatsApp Cloud API belum dikonfigurasi. Pesan tidak dikirim." });
  if (req.user.sent >= req.user.quota) return res.status(429).json({ error: "Quota internal telah habis." });
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${req.user.phoneNumberId}/messages`, { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${req.user.whatsappToken}` }, body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: parsed.data.to, type: "text", text: { preview_url: false, body: parsed.data.body } }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return res.status(response.status >= 500 ? 502 : response.status).json({ error: "Meta menolak pengiriman pesan.", details: body.error?.message || "Unknown Graph API error" });
  req.user.sent += 1;
  return res.json({ ok: true, messageId: body.messages?.[0]?.id || null, remaining: req.user.quota - req.user.sent });
});

app.get("/webhooks/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const verifyToken = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && verifyToken === (process.env.META_WEBHOOK_VERIFY_TOKEN || "")) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

app.post("/webhooks/whatsapp", (req, res) => {
  if (!process.env.META_APP_SECRET) return res.sendStatus(503);
  // Production must validate X-Hub-Signature-256 with META_APP_SECRET before persistence.
  webhookEvents.push({ receivedAt: new Date().toISOString(), payload: req.body });
  if (webhookEvents.length > 1000) webhookEvents.shift();
  return res.sendStatus(200);
});

app.get("/api/admin/users", (req, res) => {
  if (req.get("x-admin-key") !== adminKey) return res.status(403).json({ error: "Akses admin ditolak." });
  res.json({ count: users.size, users: [...users.values()].map(userView) });
});

app.use((err, _req, res, _next) => {
  console.error("request_error", err.message);
  res.status(500).json({ error: "Kesalahan internal." });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`WA.W berjalan di http://localhost:${port}`));
}

export { app, users, workspaces, webhookEvents };
