# Catatan Repository WA.W

## Tujuan

Repository ini dibuat untuk menyimpan dokumentasi awal **WA.W — WhatsApp Workspace**, termasuk perbedaan edisi Personal V4.1 dan SaaS V4.2, rancangan endpoint, fitur enterprise, paket harga yang tercantum pada materi sumber, serta arahan deployment.

## Catatan penting tentang materi sumber

Berkas yang diterima berisi dokumentasi produk, bukan source code aplikasi. Oleh karena itu, repository ini belum dapat di-install atau dijalankan dengan `npm install` dan `npm start` sampai source code, `package.json`, konfigurasi runtime, dan pengujian ditambahkan.

Beberapa klaim fitur pada materi sumber, seperti pelacakan lokasi real-time, akses komputer jarak jauh, enkripsi proprietary, status verifikasi Meta, dan engine AI, harus dianggap sebagai **klaim produk yang belum diverifikasi**. Klaim tersebut tidak boleh dipasarkan sebagai fakta teknis atau kepatuhan resmi sebelum tersedia bukti implementasi, hasil audit, dan dokumentasi vendor yang relevan.

## Keamanan dan privasi

Materi sumber memuat pengenal akun dan kode akses yang tampak sensitif. Nilai tersebut telah disamarkan dalam `DOKUMENTASI-SUMBER.md`. Jangan commit token WhatsApp, WABA ID, Phone Number ID produksi, kode remote access, API key, webhook secret, atau data pribadi pelanggan.

> Simpan secret hanya melalui secret manager atau environment variable yang terlindungi. Jika kredensial pernah dibagikan di tempat yang tidak semestinya, segera cabut dan rotasikan kredensial tersebut.

Rancangan multi-tenant harus menerapkan kontrol akses berbasis server, isolasi tenant pada setiap query, hashing atau enkripsi secret, proteksi CSRF bila relevan, validasi input, rate limiting, idempotency untuk pengiriman pesan, audit log, serta pengujian akses lintas-tenant.

## Tindak lanjut teknis

| Prioritas | Tindak lanjut | Kriteria selesai |
|---|---|---|
| Tinggi | Tambahkan source code dan `package.json` | Aplikasi dapat dibangun dari checkout bersih |
| Tinggi | Implementasikan penyimpanan secret yang aman | Tidak ada token di frontend, log, atau Git |
| Tinggi | Definisikan skema database tenant | Data dan kredensial antar pengguna terisolasi |
| Tinggi | Verifikasi integrasi resmi Meta WhatsApp Business | Credential, webhook, dan error handling terdokumentasi |
| Sedang | Tambahkan autentikasi admin dan quota enforcement | Endpoint admin tidak dapat diakses pengguna biasa |
| Sedang | Tambahkan test suite dan CI | Pull request menjalankan lint, test, dan security checks |
| Sedang | Tinjau klaim marketing dan harga | Semua klaim memiliki bukti dan persetujuan pemilik produk |

## Status repository

| Item | Status |
|---|---|
| Dokumentasi dasar | Selesai |
| Redaksi informasi sensitif | Selesai pada salinan sumber |
| Implementasi backend/frontend | Belum tersedia |
| Database produksi | Belum tersedia |
| Audit keamanan | Belum dilakukan |
| Lisensi | Belum ditentukan |

## References

[1]: `DOKUMENTASI-SUMBER.md` — Transkripsi materi sumber yang diberikan pengguna, dengan nilai sensitif disamarkan.
