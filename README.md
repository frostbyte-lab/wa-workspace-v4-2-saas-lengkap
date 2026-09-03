# WA.W — WhatsApp Workspace

Dokumentasi produk untuk **WA.W (WhatsApp Workspace)** edisi Personal V4.1 dan SaaS V4.2. Dokumen ini disusun dari materi yang diberikan pengguna dan berfokus pada struktur fitur, rancangan API, deployment, serta catatan keamanan.

> **Status:** Dokumentasi konsep/produk. Repository ini belum berisi implementasi aplikasi yang dapat dijalankan.

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

## Struktur berkas yang direncanakan

```text
/api/index.js
/public/index.html
/modules/security/anti-judol.js
/modules/remote/pc-remote.js
/modules/scanner/img-to-pdf.js
config.json
```

## Deployment yang disebutkan

Dokumen sumber menyebut Railway, Render, dan VPS sebagai target deployment. Environment variable yang direncanakan adalah `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, dan `WABA_ID`. Untuk wrapper APK, dokumen menyebut Capacitor atau Cordova.

Sebelum deployment, lakukan audit keamanan, verifikasi kepatuhan terhadap kebijakan WhatsApp/Meta, tambahkan autentikasi administrator, rate limiting, validasi webhook, rotasi secret, audit log, backup terenkripsi, serta mekanisme penghapusan data pengguna.

## Isi repository

| Berkas | Keterangan |
|---|---|
| `README.md` | Ringkasan proyek dan rancangan teknis |
| `CATATAN.md` | Catatan editorial, keamanan, dan tindak lanjut |
| `DOKUMENTASI-SUMBER.md` | Transkripsi materi sumber dengan kredensial sensitif disamarkan |

## Lisensi

Belum ditentukan. Tambahkan berkas `LICENSE` sebelum distribusi publik atau penggunaan komersial.

## References

[1]: `DOKUMENTASI-SUMBER.md` — Materi dokumentasi yang disediakan pengguna untuk repository ini.
