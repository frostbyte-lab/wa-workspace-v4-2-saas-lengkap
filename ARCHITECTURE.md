# Arsitektur WA.W resmi

WA.W menggunakan **WhatsApp Business Platform/Cloud API resmi Meta** sebagai kanal komunikasi bisnis. WA.W tidak mengakses API internal aplikasi WhatsApp pribadi, tidak membaca atau membuat Status WhatsApp pribadi, dan tidak mengkloning aplikasi WhatsApp.

## Model Workspace

Satu akun WA.W dapat memiliki satu atau lebih workspace. Setiap workspace memiliki anggota dengan role `owner`, `admin`, atau `agent`, serta koneksi WhatsApp Business sendiri melalui `phoneNumberId`, `wabaId`, dan access token yang disimpan server-side.

## Fitur Workspace

Workspace menjadi ruang kerja tim untuk inbox bersama, assignment percakapan, label, catatan internal, template pesan, quota internal opsional, audit log, dan pemisahan data antar tenant. Pesan keluar mengikuti aturan Meta mengenai opt-in, template, customer-service window, quality rating, pricing, dan messaging limits.

## Fitur yang tersedia melalui kanal resmi

Messaging API menyediakan pesan teks, media, template, interactive message, dan webhook status/incoming message. Calling API resmi ditujukan untuk percakapan bisnis dan memerlukan konfigurasi calling, permission pengguna, serta webhook `calls`. Fitur consumer seperti Status WhatsApp pribadi, daftar kontak pribadi, dan seluruh fungsi aplikasi WhatsApp bukan bagian dari akses API bisnis umum.

## Tahap berikutnya

1. Migrasikan penyimpanan `Map` ke PostgreSQL/Supabase.
2. Tambahkan authentication service, role-based access control, dan secure session cookie.
3. Tambahkan webhook verification dan event persistence.
4. Hubungkan pengiriman ke Graph API hanya jika credential workspace telah dikonfigurasi.
5. Tambahkan inbox Workspace, assignment, label, audit log, dan dashboard penggunaan.
