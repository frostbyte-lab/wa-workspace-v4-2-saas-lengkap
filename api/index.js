import crypto from "node:crypto";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 3000);
const adminKey = process.env.ADMIN_KEY || "dev-admin-key";
const users = new Map();

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
  return res.status(201).json({ userId: user.userId, sessionToken: user.sessionToken, user: userView(user) });
});

app.post("/api/login", (req, res) => {
  const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
  const user = users.get(userId);
  if (!user) return res.status(401).json({ error: "User tidak ditemukan." });
  user.sessionToken = sessionToken();
  return res.json({ userId: user.userId, sessionToken: user.sessionToken, user: userView(user) });
});

app.get("/api/me", requireUser, (req, res) => res.json({ user: userView(req.user) }));

app.post("/api/send", requireUser, async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Nomor tujuan atau isi pesan tidak valid." });
  if (req.user.sent >= req.user.quota) return res.status(429).json({ error: "Quota pesan telah habis." });
  if (!process.env.WHATSAPP_TOKEN || !process.env.PHONE_NUMBER_ID) {
    return res.status(503).json({ error: "Integrasi WhatsApp belum dikonfigurasi. Pesan tidak dikirim." });
  }
  req.user.sent += 1;
  return res.json({ ok: true, messageId: `demo_${crypto.randomBytes(8).toString("hex")}`, remaining: req.user.quota - req.user.sent });
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

export { app, users };
