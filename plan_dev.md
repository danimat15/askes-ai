# Rencana Pengembangan Aplikasi Askes AI

Dokumen ini menguraikan rencana pengembangan untuk aplikasi **Askes AI**, sebuah platform layanan gratis yang menyediakan agen medis berbasis AI yang dapat diakses melalui suara dan teks. Rencana ini disusun berdasarkan ide-ide yang terdapat dalam file `RAG_ChatBot_docter.txt`, `Voice_Docter.txt`, dan `Voice_Docter_missing_part.txt`.

## Visi Produk

Menciptakan asisten medis virtual yang dapat berinteraksi dengan pengguna secara *real-time* dan gratis, memahami gejala mereka melalui teks atau suara, **menganalisis gambar yang diunggah**, memberikan saran berdasarkan pengetahuan medis yang terkurasi (RAG), dan menghubungkan mereka dengan "agen spesialis" AI yang sesuai, lengkap dengan fitur riwayat konsultasi dan laporan.

## Tech Stack Utama

- **Framework**: Next.js (React, TypeScript)
- **Styling**: Tailwind CSS, ShadCN UI, & Aceternity UI
- **Database**: Neon (PostgreSQL) dengan Drizzle ORM
- **Autentikasi**: Clerk
- **Voice Agent**: Vapi.ai
- **Speech-to-Text (Streaming)**: AssemblyAI
- **LLM & Embeddings**: **Google Gemini Models** (e.g., Gemini Pro, **Gemini Pro Vision**, Gemini Flash, dan model embedding-nya)
- **Vector Store**: Pinecone
- **Deployment**: Vercel

---

## Rencana Pengembangan Bertahap

### Fase 0: Fondasi dan Penyiapan Proyek

Tujuan: Menyiapkan struktur dasar proyek dan komponen inti.

1.  **Inisialisasi Proyek**:
    -   Membuat proyek Next.js baru dengan TypeScript dan Tailwind CSS.
    -   Menginisialisasi Drizzle ORM dan menghubungkannya ke database Neon.
2.  **Struktur Direktori**:
    -   Membuat struktur folder untuk `components`, `app`, `lib`, `config`, dll.
3.  **UI Library & Styling**:
    -   Menginstal dan mengkonfigurasi ShadCN UI dan Aceternity UI.
    -   Mengatur tema utama aplikasi menjadi dark mode dengan aksen warna hijau.
4.  **Autentikasi Pengguna**:
    -   Mengintegrasikan Clerk untuk sistem login dan registrasi.
    -   Membuat halaman `/sign-in` dan `/sign-up`.
    -   Melindungi rute-rute aplikasi yang memerlukan autentikasi.
5.  **Skema Database Awal**:
    -   Mendefinisikan skema awal untuk tabel `users` (untuk menyimpan data pengguna) dan `consultation_sessions` (untuk riwayat konsultasi) menggunakan Drizzle.

### Fase 1: Penyiapan Backend AI (RAG & Multimodal)

Tujuan: Membangun fungsionalitas RAG dan multimodal sebagai dasar dari sistem AI.
*Catatan: Pengembangan RAG akan mengacu pada contoh dan pendekatan yang ditemukan di folder `self-multimodal-rag`.*

1.  **Pipeline Ingesti Data (RAG)**:
    -   Membuat skrip atau API endpoint untuk memproses file PDF medis.
    -   Mengimplementasikan logika untuk:
        -   Membaca dan mengekstrak teks dari PDF.
        -   Membagi teks menjadi beberapa bagian (chunking).
        -   Membuat *embeddings* dari setiap bagian menggunakan **model embedding Gemini**.
2.  **Penyiapan Vector Store**:
    -   Mengkonfigurasi akun Pinecone.
    -   Menyimpan *embeddings* yang telah dibuat ke dalam *vector index* di Pinecone.
3.  **API Chat Multimodal**:
    -   Membangun API endpoint yang dapat menangani dua jenis permintaan:
        -   (a) Pertanyaan teks murni, yang akan menggunakan alur RAG (pencarian Pinecone + prompt) untuk menjawab berdasarkan basis data PDF.
        -   (b) Pertanyaan teks yang disertai dengan unggahan gambar, yang akan dikirim langsung ke **model Gemini Pro Vision** untuk analisis.

### Fase 2: Dashboard dan Alur Konsultasi

Tujuan: Membangun UI utama dan alur pemilihan interaksi.

1.  **UI Dashboard**:
    -   Merancang halaman dashboard utama yang akan menampilkan riwayat konsultasi dan daftar agen spesialis menggunakan komponen dari Aceternity UI untuk tampilan modern.
2.  **Alur "Mulai Konsultasi"**:
    -   Membuat dialog (popup) di mana pengguna dapat memasukkan gejala atau keluhan awal dalam bentuk teks.
3.  **API Saran Spesialis**:
    -   Membuat API endpoint yang menerima input gejala dari pengguna.
    -   Endpoint ini akan memanggil **model Gemini** dengan *prompt* khusus untuk menganalisis gejala dan merekomendasikan spesialis yang paling sesuai dari daftar agen AI yang telah ditentukan.
4.  **Menampilkan Agen AI**:
    -   Menampilkan daftar agen spesialis AI (lengkap dengan gambar dan deskripsi) di dashboard.
5.  **Popup Pilihan Mode Interaksi**:
    -   Setelah pengguna memilih spesialis, tampilkan popup dialog kedua yang memberikan pilihan mode konsultasi: **"Chat Teks & Foto"** atau **"Percakapan Suara"**.
    -   Mengarahkan pengguna ke antarmuka yang sesuai berdasarkan pilihan mereka.

### Fase 3: Integrasi Mode Interaksi (Chat & Voice)

Tujuan: Mengimplementasikan kedua mode interaksi yang telah dipilih pengguna.

1.  **Antarmuka Chat Teks Multimodal**:
    -   Membuat halaman atau komponen UI khusus untuk percakapan teks, yang mencakup:
        -   Input teks standar.
        -   Tombol/fitur untuk **mengunggah file gambar** (misalnya, foto ruam kulit, luka, dll.).
    -   Menghubungkan antarmuka ini dengan **API Chat Multimodal** yang dibuat pada Fase 1.
2.  **Antarmuka Percakapan Suara**:
    -   Mengkonfigurasi Vapi.ai untuk terhubung dengan **model Gemini**.
    -   Membuat halaman dinamis (`/dashboard/conversation/voice/[sessionId]`) untuk percakapan suara.
    -   Mengintegrasikan Vapi client-side SDK untuk memulai dan mengakhiri panggilan suara, serta menampilkan transkrip secara *real-time*.
    -   Secara dinamis mengkonfigurasi agen Vapi dengan *prompt* yang sesuai berdasarkan spesialis yang dipilih pengguna.

### Fase 4: Laporan Konsultasi dan Riwayat

Tujuan: Menyimpan dan menampilkan hasil dari setiap sesi konsultasi.

1.  **API Generator Laporan**:
    -   Membuat API endpoint yang dipicu setelah sesi (baik chat maupun suara) berakhir.
    -   Endpoint ini akan mengirimkan seluruh transkrip percakapan (dan gambar jika ada) ke **model Gemini** dengan *prompt* rekayasa khusus untuk menghasilkan laporan medis terstruktur dalam format JSON.
2.  **Penyimpanan ke Database**:
    -   Menyimpan laporan yang dihasilkan dan transkrip lengkap ke dalam tabel `consultation_sessions` di database.
3.  **Tampilan Riwayat**:
    -   Mengambil dan menampilkan daftar riwayat konsultasi pengguna di dashboard.
    -   Membuat fitur "Lihat Laporan" untuk menampilkan detail laporan dari setiap sesi.

### Fase 5: Finalisasi dan Deployment

Tujuan: Menyebarkan aplikasi ke publik.

1.  **Persiapan Deployment**:
    -   Memastikan semua variabel lingkungan (API keys, dll.) sudah disiapkan untuk produksi.
2.  **Deployment ke Vercel**:
    -   Menghubungkan repositori GitHub ke Vercel.
    -   Memicu proses deployment.
3.  **Pengujian Akhir**:
    -   Melakukan pengujian menyeluruh pada aplikasi yang sudah di-*deploy* untuk memastikan semua fitur berfungsi dengan baik.

---
*Catatan: Setiap fase dapat dipecah lebih lanjut menjadi tugas-tugas yang lebih kecil. Fleksibilitas akan dijaga untuk menyesuaikan prioritas berdasarkan kemajuan pengembangan.*
