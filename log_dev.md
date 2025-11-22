# Log Pengembangan Proyek Askes AI

Dokumen ini berisi ringkasan dari semua langkah pengembangan, perbaikan, dan keputusan arsitektural yang telah dilakukan pada proyek Askes AI sejauh ini.

---

### Fase 0: Fondasi dan Penyiapan Proyek

Tujuan dari fase ini adalah untuk membangun kerangka dasar aplikasi.

1.  **Struktur Proyek**:
    *   Proyek diinisialisasi menggunakan Next.js dengan TypeScript.
    *   Struktur folder dasar (`app`, `components`, `lib`, `public`, dll.) telah disiapkan.

2.  **Desain & UI**:
    *   **Tema**: Tema utama aplikasi diatur ke **Dark Mode** dengan **aksen warna hijau** melalui `app/globals.css`.
    *   **Pustaka UI**: ShadCN UI dan Aceternity UI telah diintegrasikan. Beberapa komponen ShadCN (`dialog`, `textarea`, `table`, `skeleton`) telah diinstal.
    *   **Halaman Landing**: Halaman landing awal (`app/page.tsx`) telah dibuat dan kemudian disempurnakan dengan komponen `WavyBackground` dari Aceternity UI untuk tampilan yang lebih modern dan estetis.
    *   **Navbar & Favicon**: Logo aplikasi (`logo.png`) telah ditetapkan sebagai favicon dan juga ditampilkan di komponen `Navbar` yang bersifat reusable. Padding pada Navbar juga telah disesuaikan agar lebih proporsional.

3.  **Database & Skema**:
    *   **Koneksi**: Koneksi ke database Neon (PostgreSQL) diatur melalui variabel lingkungan `DATABASE_URL`.
    *   **ORM**: Drizzle ORM diatur sebagai alat untuk berinteraksi dengan database.
    *   **Skema**: Skema database awal didefinisikan di `drizzle/schema.ts`, mencakup tabel `users` dan `consultation_sessions`.
    *   **Perbaikan Skema**: Dilakukan beberapa perbaikan pada skema, seperti mengganti tipe data `serial` menjadi `bigserial` untuk mengatasi masalah kompatibilitas driver, dan menambahkan `clerkId` untuk integrasi yang lebih baik dengan sistem otentikasi.

4.  **Otentikasi & Sinkronisasi Pengguna**:
    *   **Clerk**: Clerk diintegrasikan untuk menangani registrasi dan login pengguna.
    *   **Middleware**: File `middleware.ts` dikonfigurasi untuk melindungi rute-rute aplikasi (seperti `/dashboard`) dan membiarkan rute publik (seperti `/`) dapat diakses oleh semua orang.
    *   **Sinkronisasi Pengguna**: Untuk mengatasi masalah pengguna yang tidak tersimpan di database, dibuat API endpoint `/api/users` dan sebuah `UserSyncProvider`. Alur ini memastikan bahwa setiap kali pengguna login, datanya akan secara otomatis diperiksa dan disimpan di database lokal jika belum ada.
    *   **Perbaikan Otentikasi API**: Mengalami dan memperbaiki serangkaian error `401 Unauthorized` pada panggilan API dengan memindahkan rute API ke bawah `/dashboard/api/` dan mengadopsi `currentUser()` dari Clerk di sisi server, mengikuti contoh dari proyek `ai-agent-bps`.

---

### Fase 1-4: Implementasi Alur Aplikasi Inti

Fase-fase ini digabungkan untuk membangun alur kerja utama aplikasi dari awal hingga akhir.

1.  **Alur Konsultasi (Refactoring)**:
    *   Awalnya, alur konsultasi dibuat dengan beberapa dialog terpisah.
    *   Berdasarkan permintaan untuk mengikuti contoh `ai-agent-bps`, alur ini di-refactor menjadi satu komponen dialog utama (`ConsultationDialog.tsx`) yang menangani alur multi-langkah:
        1.  Input gejala oleh pengguna.
        2.  Memanggil API untuk mendapatkan saran spesialis.
        3.  Menampilkan daftar agen yang disarankan.
        4.  Membiarkan pengguna memilih satu agen.
        5.  Membuat sesi dan mengarahkan ke halaman konsultasi.

2.  **API Backend**:
    *   **Saran Spesialis (`/suggest-specialist`)**: API ini dibuat untuk menerima gejala, membuat prompt, dan memanggil model Gemini untuk merekomendasikan daftar agen yang relevan. Logika ini disempurnakan untuk meniru strategi prompting dari `ai-agent-bps` untuk keandalan yang lebih baik.
    *   **Membuat Sesi (`/create-session`)**: API ini dibuat untuk mencatat sesi konsultasi baru ke database sebelum pengguna diarahkan ke halaman chat atau telepon.
    *   **Riwayat (`/history`)**: API ini dibuat untuk mengambil semua riwayat konsultasi milik pengguna yang sedang login.
    *   **Detail Sesi (`/session/[sessionId]`)**: API ini dibuat untuk mengambil detail spesifik dari satu sesi.
    *   **Chat (`/chat`)**: API ini menangani interaksi chat (teks dan gambar), memanggil model Gemini Pro atau Gemini Pro Vision.

3.  **Antarmuka Interaksi**:
    *   **Dashboard (`/dashboard`)**: Halaman utama setelah login, menampilkan `HistoryList` dan `AgentList`.
    *   **Halaman Chat (`/chat/[sessionId]`)**: Halaman dinamis untuk interaksi berbasis teks dan gambar.
    *   **Halaman Suara (`/voice/[sessionId]`)**: Halaman dinamis untuk interaksi suara, terintegrasi dengan Vapi SDK.

4.  **Riwayat dan Laporan**:
    *   **API Laporan (`/generate-report`)**: Dibuat untuk menerima transkrip percakapan dan menghasilkan laporan medis terstruktur menggunakan Gemini.
    *   **Tampilan Riwayat**: Komponen `HistoryList` dibuat untuk menampilkan daftar riwayat di dasbor.
    *   **Dialog Laporan**: Komponen `ReportDialog` dibuat untuk menampilkan detail laporan saat tombol "Lihat Laporan" diklik.

---

### Status Saat Ini & Isu yang Ditunda

*   **Fungsionalitas Utama**: Sebagian besar alur utama, mulai dari landing page, login, saran agen, hingga interaksi chat/suara dan tampilan riwayat, telah diimplementasikan dan bug-nya telah diperbaiki.
*   **Isu yang Ditunda (On Hold)**: Implementasi **RAG (Retrieval-Augmented Generation)** dari file PDF medis ditunda untuk memprioritaskan alur demo utama. Kode awal untuk ingesti data (`ingest_data.ts`) telah ditulis tetapi mengalami beberapa kendala teknis.
*   **Langkah Selanjutnya**: Melakukan pengujian akhir pada alur yang telah diperbaiki, lalu melanjutkan ke 
*   **Fase 5: Deployment**.
