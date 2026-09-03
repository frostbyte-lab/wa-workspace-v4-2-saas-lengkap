# WA.W — WhatsApp Workspace: Dokumentasi Sumber

**Pemilik/merek yang tercantum:** FrostByte Tech. Ltd  
**Versi:** V4.1 Personal Edition dan V4.2 SaaS Edition  
**Harga yang tercantum pada sumber:** Rp450.000 per tahun

> Dokumen ini adalah transkripsi materi yang diberikan pengguna. Fitur dan klaim di dalamnya belum diverifikasi secara teknis maupun legal.

## V4.1 — Personal Edition

Edisi personal ditujukan untuk satu pemilik dan menggunakan kredensial milik pemilik tersebut. Materi sumber menyebut fitur clone dua akun WhatsApp melalui QR scan, konversi gambar ke PDF dengan watermark, akses PC jarak jauh, filter anti-judol dan anti-spam, pelacakan lokasi real-time, enkripsi proprietary, engine AI, serta pembaruan otomatis.

Struktur berkas yang disebutkan:

```text
/api/index.js
/public/index.html
/modules/security/anti-judol.js
/modules/remote/pc-remote.js
/modules/scanner/img-to-pdf.js
```

Perintah instalasi yang dicantumkan adalah `npm install`, kemudian `npm start`, dengan dashboard di `http://localhost:3000`. Source code dan `package.json` tidak termasuk dalam materi yang diterima.

## V4.2 — SaaS Edition

Edisi SaaS dirancang untuk banyak pengguna. Setiap pengguna mendaftarkan kredensial WhatsApp miliknya sendiri, sehingga token dan Phone Number ID tidak boleh dibagi lintas tenant.

Endpoint yang dicantumkan:

| Metode | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/register` | Menerima email, Phone Number ID, token WhatsApp, dan WABA ID; mengembalikan `userId` |
| `POST` | `/api/login` | Login menggunakan `userId` |
| `POST` | `/api/send` | Mengirim WhatsApp menggunakan header `x-user-id` |
| `GET` | `/api/admin/users` | Administrasi pengguna |

Materi sumber menyebut objek `USERS {}` sebagai penyimpanan awal dan menyarankan database seperti MongoDB atau Supabase untuk produksi. Quota yang disebutkan adalah 1.000 pesan untuk paket Free dan 10.000 pesan untuk paket Pro. Nilai paket, pembayaran QRIS/Midtrans, dan harga harus dikonfirmasi kembali sebelum dipublikasikan.

## Fitur enterprise yang diklaim

Materi sumber mencantumkan remote access PC, fingerprint authentication, CamScanner, barcode dan QR scanner, custom watermark, anti-banned system, pelacakan lokasi real-time, filter anti-judol dan anti-spam, enkripsi proprietary, serta engine AI. Semua fitur tersebut memerlukan implementasi, pengujian, dan dokumentasi keamanan sebelum dinyatakan tersedia.

## Deployment

Target deployment yang tercantum adalah Railway, Render, atau VPS. Environment variable yang disebut adalah:

```text
WHATSAPP_TOKEN=<gunakan secret manager atau environment variable>
PHONE_NUMBER_ID=<gunakan nilai non-produksi saat development>
WABA_ID=<gunakan nilai non-produksi saat development>
```

Untuk packaging APK, materi sumber menyebut wrapper Capacitor atau Cordova untuk `public/index.html`.

## Redaksi keamanan

Pengenal akun dan kode akses yang ada pada materi asli tidak disalin ke repository ini. Gunakan placeholder dan lakukan rotasi segera apabila nilai asli pernah dipublikasikan atau dibagikan kepada pihak yang tidak berwenang.

## References

[1]: `CATATAN.md` — Catatan editorial dan keamanan repository.
