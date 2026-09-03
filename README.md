# WA.W — WhatsApp Workspace

Starter implementation untuk **WA.W SaaS V4.2**, berdasarkan dokumentasi produk yang tersimpan di repository ini. Implementasi ini menyediakan dashboard web sederhana dan API multi-tenant untuk registrasi, login, quota, dan pengiriman pesan.

> **Status:** MVP development. Penyimpanan pengguna masih berupa memori proses dan pengiriman WhatsApp sengaja tidak aktif sampai kredensial resmi dikonfigurasi. Jangan gunakan sebagai deployment produksi tanpa audit keamanan dan migrasi database.

## Fitur yang sudah tersedia

| Area | Status | Keterangan |
|---|---|---|
| Dashboard web | Selesai | Registrasi, login, quota, dan form pengiriman |
| API registrasi dan login | Selesai | Validasi input dan pembuatan user/session |
| Isolasi tenant | Starter | Request memakai `x-user-id` dan `x-session-token`; perlu database untuk produksi |
| Quota | Selesai | Free 1.000 pesan, Pro 10.000 pesan |
| Admin users | Selesai | Dilindungi `x-admin-key` |
| WhatsApp Cloud API | Belum aktif | Endpoint mengembalikan 503 jika environment variable belum tersedia |
| Database produksi | Belum tersedia | Ganti `Map` di `api/index.js` dengan database terenkripsi |

## Menjalankan secara lokal

```bash
npm install
npm start
```

Buka `http://localhost:3000`. Untuk pengembangan gunakan `npm run dev`, dan jalankan pengujian dengan `npm test`.

## Environment variable

```bash
PORT=3000
ADMIN_KEY=ganti-dengan-secret-admin
WHATSAPP_TOKEN=ganti-dengan-token-resmi
PHONE_NUMBER_ID=ganti-dengan-phone-number-id
WABA_ID=ganti-dengan-waba-id
```

Simpan nilai tersebut di environment runtime atau secret manager, bukan di repository.

## Ringkasan edisi

| Edisi | Sasaran | Model penggunaan | Komponen utama |
|---|---|---|---|
| V4.1 Personal | Pemilik tunggal | Satu akun dan kredensial milik pemilik | Dashboard, pemindaian dokumen, filter pesan, akses jarak jauh |
| V4.2 SaaS | Banyak pelanggan | Multi-tenant dengan kredensial WhatsApp terpisah per pengguna | Registrasi, login, pengiriman pesan, quota, administrasi pengguna |

## Rancangan endpoint V4.2

| Metode | Endpoint | Tujuan |
|---|---|---|
| `POST` | `/api/register` | Mendaftarkan email, Phone Number ID, token WhatsApp, dan WABA ID milik pengguna |
| `POST` | `/api/login` | Login menggunakan `userId` |
| `POST` | `/api/send` | Mengirim pesan dengan identitas pengguna melalui header `x-user-id` |
| `GET` | `/api/admin/users` | Menampilkan jumlah atau daftar pengguna untuk kebutuhan administrasi |

Implementasi produksi perlu mengganti penyimpanan objek `USERS {}` dengan database yang aman. Setiap tenant harus memiliki isolasi data dan kredensial yang kuat. Token tidak boleh disimpan di frontend, `localStorage`, log, atau repository.

## Rancangan endpoint V4.2

```text
/api/index.js
/public/index.html
/modules/security/anti-judol.js
/modules/remote/pc-remote.js
/modules/scanner/img-to-pdf.js
config.json
```

## Keamanan dan batasan

Token WhatsApp tidak pernah dikirim kembali ke frontend dan tidak ditulis ke log oleh aplikasi. Namun, karena starter menggunakan `Map`, data hilang saat proses restart dan token masih berada di memori. Sebelum produksi, tambahkan database, hash atau enkripsi secret, session cookie `HttpOnly`/`Secure`, rate limiting, CSRF protection bila relevan, audit log, validasi signature webhook, rotasi secret, backup terenkripsi, dan penghapusan data tenant.

Klaim fitur seperti remote access, pelacakan lokasi, anti-banned, engine AI, dan enkripsi proprietary belum diimplementasikan maupun diverifikasi dalam repository ini.

## Deployment yang disebutkan

Dokumen sumber menyebut Railway, Render, dan VPS sebagai target deployment. Environment variable yang direncanakan adalah `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, dan `WABA_ID`. Untuk wrapper APK, dokumen menyebut Capacitor atau Cordova.

Sebelum deployment, lakukan audit keamanan, verifikasi kepatuhan terhadap kebijakan WhatsApp/Meta, tambahkan autentikasi administrator, rate limiting, validasi webhook, rotasi secret, audit log, backup terenkripsi, serta mekanisme penghapusan data pengguna.

## Isi repository

| Berkas | Keterangan |
|---|---|
| `api/index.js` | Express API, validasi, sesi demo, quota, dan endpoint admin |
| `public/index.html` | Dashboard frontend |
| `test/api.test.js` | Smoke tests endpoint utama |
| `README.md` | Dokumentasi implementasi dan rancangan teknis |
| `CATATAN.md` | Catatan editorial, keamanan, dan tindak lanjut |
| `DOKUMENTASI-SUMBER.md` | Transkripsi materi sumber dengan kredensial sensitif disamarkan |

## Lisensi

Belum ditentukan. Tambahkan berkas `LICENSE` sebelum distribusi publik atau penggunaan komersial.

## References

[1]: `DOKUMENTASI-SUMBER.md` — Materi dokumentasi yang disediakan pengguna untuk repository ini.
