import test from "node:test";
import assert from "node:assert/strict";
import { app, users } from "../api/index.js";

let server;
let baseUrl;

test.before(async () => {
  users.clear();
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint tersedia", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
});

test("register tidak mengembalikan token WhatsApp", async () => {
  const response = await fetch(`${baseUrl}/api/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", phoneNumberId: "123456789", wabaId: "987654321", whatsappToken: "token-value-long-enough" })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.user.whatsappToken, undefined);
  assert.equal(typeof body.sessionToken, "string");
});

test("admin endpoint menolak key yang salah", async () => {
  const response = await fetch(`${baseUrl}/api/admin/users`, { headers: { "x-admin-key": "wrong" } });
  assert.equal(response.status, 403);
});

test("workspace dapat dibuat dan dibaca oleh user", async () => {
  const user = [...users.values()][0];
  const create = await fetch(`${baseUrl}/api/workspaces`, { method: "POST", headers: { "content-type": "application/json", "x-user-id": user.userId, "x-session-token": user.sessionToken }, body: JSON.stringify({ name: "Support Team" }) });
  assert.equal(create.status, 201);
  const list = await fetch(`${baseUrl}/api/workspaces`, { headers: { "x-user-id": user.userId, "x-session-token": user.sessionToken } });
  assert.equal((await list.json()).workspaces.length, 2);
});

test("webhook menolak token verifikasi yang salah", async () => {
  const response = await fetch(`${baseUrl}/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=123`);
  assert.equal(response.status, 403);
});
