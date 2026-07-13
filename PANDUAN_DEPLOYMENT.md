# Panduan Lengkap Deployment VisionAI Studio (Dari Nol Hingga Online 24/7)

Panduan ini disusun secara alur mengalir, jelas, dan super detail bagi Anda yang **belum pernah menginstal atau mengonfigurasi PostgreSQL sebelumnya**.

Kabar baiknya: **Anda TIDAK PERLU mengunduh atau menginstal program PostgreSQL di laptop/komputer Anda!**  
Untuk aplikasi modern berbasis Next.js, standar profesional terbaik adalah menggunakan **Database PostgreSQL Cloud Gratis** (seperti **Neon.tech** atau **Supabase**) sehingga database Anda langsung online 24 jam sehari dan siap diakses oleh aplikasi saat di-deploy ke **Vercel**.

---
## Alur Singkat Deployment (3 Tahap Utama)
```
[Tahap 1: Database Cloud] ---> [Tahap 2: Hubungkan ke Laptop] ---> [Tahap 3: Deploy ke Vercel]
  Daftar akun gratis di           Masukkan URL Database ke          Hubungkan GitHub &
  Neon.tech / Supabase            file .env & jalankan migrasi       Vercel agar online 24/7
```

---

## TAHAP 1: Membuat Database PostgreSQL Gratis di Cloud (Tanpa Install Apa pun)

Pilihan paling mudah, cepat, dan 100% gratis untuk Next.js + Prisma adalah **Neon.tech** (Serverless PostgreSQL).

### Langkah 1.1: Daftar Akun Neon
1. Buka browser dan kunjungi situs resmi: **[https://neon.tech](https://neon.tech)**
2. Klik tombol **"Sign Up"** di kanan atas.
3. Pilih **"Continue with GitHub"** atau **"Continue with Google"** (paling instan).

### Langkah 1.2: Buat Proyek Database Baru
1. Setelah masuk ke dasbor Neon, klik tombol **"Create Project"** (Buat Proyek).
2. Isi pengaturan berikut:
   - **Project name**: `visionai-studio`
   - **Postgres version**: `16` (atau default yang disediakan)
   - **Region**: Pilih region terdekat (misal: `Singapore / ap-southeast-1`)
3. Klik tombol **"Create Project"**.

### Langkah 1.3: Salin URL Koneksi Database (Connection String)
1. Setelah proyek selesai dibuat (sekitar 5 detik), akan muncul kotak dialog **Connection Details**.
2. Pastikan dropdown framework memilih **Prisma** atau **Postgres**.
3. Anda akan melihat teks URL panjang seperti berikut:
   ```env
   postgresql://neondb_owner:AbC123xYz@ep-silent-tree-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Salin (Copy)** URL tersebut dan simpan sementara di Notepad. URL ini adalah kunci masuk ke database Anda.

---

## TAHAP 2: Menghubungkan Proyek ke Database PostgreSQL

Sekarang kita hubungkan proyek web di laptop Anda dengan database PostgreSQL Cloud yang baru saja dibuat.

### Langkah 2.1: Buat File `.env` di Folder Proyek
1. Buka folder proyek Anda (`c:\web_kaggle`) di Visual Studio Code.
2. Buat file baru bernama `.env` di folder utama (sejajar dengan `package.json`).
3. Tempelkan URL database Anda ke dalam file `.env` dengan format:
   ```env
   DATABASE_URL="postgresql://neondb_owner:AbC123...neon.tech/neondb?sslmode=require"
   ```

### Langkah 2.2: Kirim Skema Tabel ke Database Cloud (Migrasi)
Buka terminal di Visual Studio Code (`Ctrl + ~`), lalu jalankan perintah berikut untuk membuat struktur tabel secara otomatis di PostgreSQL Cloud:

```bash
npx prisma db push
```

> **Apa yang terjadi?**  
> Perintah ini membaca file `prisma/schema.prisma` Anda dan secara otomatis membuat tabel-tabel (seperti User, Submission, Dataset, dll.) langsung di server PostgreSQL Cloud Anda.

Jika berhasil, terminal akan menampilkan pesan sukses:  
`🚀 Your database is now in sync with your Prisma schema.`

### Langkah 2.3: Buat Prisma Client
Jalankan perintah ini agar kode aplikasi mengenali tabel-tabel database:
```bash
npx prisma generate
```

---

## TAHAP 3: Mengunggah Kode ke GitHub

Vercel membutuhkan repositori Git agar dapat mendeteksi pembaruan otomatis setiap kali Anda melakukan perubahan kode.

### Langkah 3.1: Simpan Perubahan (Git Commit)
Buka terminal proyek dan jalankan perintah berurutan:
```bash
git init
git add .
git commit -m "Siap deploy VisionAI Studio ke produksi"
```

### Langkah 3.2: Buat Repositori di GitHub
1. Buka **[https://github.com](https://github.com)** dan login.
2. Klik tombol **"+"** di sudut kanan atas -> **New repository**.
3. Beri nama: `visionai-studio`.
4. Pilih **Private** atau **Public** sesuai preferensi Anda.
5. Klik **Create repository**.

### Langkah 3.3: Upload Kode ke GitHub
Salin perintah yang diberikan oleh GitHub, contohnya:
```bash
git branch -M main
git remote add origin https://github.com/username-anda/visionai-studio.git
git push -u origin main
```

---

## TAHAP 4: Deploy Aplikasi ke Vercel (Online 24/7 Gratis)

Vercel adalah platform hosting resmi dari pencipta Next.js. Proses deploy di sini hanya membutuhkan beberapa klik.

### Langkah 4.1: Daftar / Masuk ke Vercel
1. Buka **[https://vercel.com](https://vercel.com)**.
2. Klik **"Sign Up"** -> pilih **"Continue with GitHub"**.

### Langkah 4.2: Import Proyek GitHub
1. Di dasbor Vercel, klik tombol **"Add New..."** -> **"Project"**.
2. Cari repositori `visionai-studio` lalu klik tombol **"Import"**.

### Langkah 4.3: Masukkan Environment Variable (SANGAT PENTING!)
Sebelum mengklik tombol Deploy, buka bagian **Environment Variables** di layar konfigurasi Vercel:
1. Di kolom **Key**, ketik: `DATABASE_URL`
2. Di kolom **Value**, tempelkan URL PostgreSQL Cloud Anda (sama persis dengan isi file `.env` di Langkah 2.1).
3. Klik tombol **Add**.

### Langkah 4.4: Klik Deploy!
1. Klik tombol **"Deploy"** berwarna biru.
2. Tunggu sekitar 1–2 menit saat Vercel membangun aplikasi Anda.
3. Setelah selesai, layar akan menampilkan animasi konfeti 🎉 dan tautan resmi website Anda (misal: `https://visionai-studio.vercel.app`).

---

## TAHAP 5: Cara Update Website di Masa Depan

Setiap kali Anda mengubah desain atau fitur di laptop, Anda cukup menjalankan 3 perintah ini di terminal:
```bash
git add .
git commit -m "Pembaruan fitur baru"
git push
```
Dalam hitungan detik, **Vercel akan mendeteksi perubahan tersebut dan memperbarui website live Anda secara otomatis!**

---

## Tips & FAQ Tambahan

- **Apakah laptop saya harus menyala terus?**  
  *Tidak.* Database dan website berjalan di server cloud Neon & Vercel yang online 24/7 tanpa henti.
- **Bagaimana cara mengedit isi data tabel database saya?**  
  Jalankan perintah `npx prisma studio` di terminal laptop Anda. Ini akan membuka antarmuka tabel visual di browser layaknya Excel untuk menambah atau menghapus data.
