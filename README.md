# TABUNGAN ATLIT IKS PI KERA SAKTI CABANG KOTA KEDIRI

Sistem Manajemen Tabungan Digital Atlet dan Anggota IKS PI Kera Sakti Cabang Kota Kediri berbasis Web SPA (React + TypeScript + Vite + Tailwind CSS) yang terintegrasi dengan Google Sheets via Google Apps Script.

---

## 🚀 Panduan Setup & Deployment (GitHub & Vercel)

Panduan ini disusun secara langkah demi langkah (*step-by-step*) khusus untuk pemula agar aplikasi dapat di-hosting secara publik, gratis, dan otomatis diperbarui setiap kali ada perubahan kode.

---

### 📋 Alur Kerja Utama
```
Komputer Lokal / AI Studio ──(git push)──> Repository GitHub ──(otomatis build)──> Hosting Vercel (Online)
```

---

### 1. Persiapan Awal
1. **Buat Akun GitHub**: Daftar di [github.com](https://github.com/) jika belum punya.
2. **Buat Akun Vercel**: Daftar di [vercel.com](https://vercel.com/) dan pilih **"Continue with GitHub"** (agar akun GitHub langsung terhubung).
3. **Instalasi di Komputer (Jika ingin edit di laptop)**:
   - Unduh dan pasang **Git**: [git-scm.com](https://git-scm.com/)
   - Unduh dan pasang **Node.js** (versi LTS v20 atau v22): [nodejs.org](https://nodejs.org/)
   - Pasang **VS Code** (rekomendasi editor): [code.visualstudio.com](https://code.visualstudio.com/)

---

### 2. Membuat Repository Baru di GitHub
1. Buka [github.com](https://github.com/) dan login.
2. Klik tombol **"+"** di pojok kanan atas, lalu pilih **"New repository"**.
3. Isi kolom:
   - **Repository name**: `tabungan-atlit-ikspi-kediri` (atau nama lain tanpa spasi).
   - **Visibility**: Pilih **Public** atau **Private** (Vercel mendukung keduanya secara gratis).
   - Biarkan opsi *Add a README file*, *.gitignore*, dan *license* **TIDAK DICENTANG** (kosongkan).
4. Klik **"Create repository"**.
5. Simpan URL repository Anda, contoh: `https://github.com/username-anda/tabungan-atlit-ikspi-kediri.git`.

---

### 3. Mengunggah (Push) Kode ke GitHub

Buka folder project di komputer Anda menggunakan terminal / command prompt / Git Bash, lalu jalankan perintah berikut secara berurutan:

```bash
# 1. Inisialisasi git di folder project
git init

# 2. Tambahkan semua file project ke staging area
git add .

# 3. Buat commit pertama
git commit -m "feat: inisialisasi sistem tabungan atlit iks pi kediri"

# 4. Ganti nama branch utama menjadi main
git branch -M main

# 5. Hubungkan folder lokal dengan repository GitHub Anda
# (Ganti URL di bawah dengan URL repository GitHub yang Anda buat tadi)
git remote add origin https://github.com/username-anda/tabungan-atlit-ikspi-kediri.git

# 6. Unggah kode ke GitHub
git push -u origin main
```

*(Jika diminta login oleh Git, masukkan username dan password/Personal Access Token GitHub Anda).*

---

### 4. Menghubungkan Repository GitHub ke Vercel

1. Buka dashboard [vercel.com](https://vercel.com/) dan login.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Di bagian **"Import Git Repository"**, cari repository `tabungan-atlit-ikspi-kediri` yang baru saja di-push, lalu klik tombol **"Import"**.
4. Di halaman konfigurasi project:
   - **Project Name**: Tetap atau sesuaikan (misal: `tabungan-atlit-ikspi`).
   - **Framework Preset**: Vercel otomatis mendeteksi **Vite**.
   - **Root Directory**: Biarkan `./`.
   - **Build Command**: `vite build` (default).
   - **Output Directory**: `dist` (default).
5. **Environment Variables (Variabel Lingkungan)**:
   - Buka dropdown **Environment Variables**.
   - Tambahkan key berikut (jika sudah memiliki Web App URL Apps Script):
     - **Key**: `VITE_API_URL`
     - **Value**: URL Google Apps Script Anda (contoh: `https://script.google.com/macros/s/AKfycb.../exec`)
   *(Catatan: Jika belum diisi, aplikasi akan tetap berjalan dengan penyimpanan data lokal di browser).*
6. Klik tombol **"Deploy"**.
7. Tunggu proses build selama 30-60 detik hingga muncul konfirmasi confetti **"Congratulations!"**.
8. Klik link domain yang diberikan oleh Vercel (contoh: `https://tabungan-atlit-ikspi.vercel.app`).

---

### 5. Cara Memperbarui Aplikasi (Continuous Deployment)

Setelah Vercel terhubung ke GitHub, Anda tidak perlu mengulang proses deploy manual. Cukup jalankan perintah berikut setiap kali selesai mengubah kode:

```bash
git add .
git commit -m "Update fitur atau perbaikan"
git push
```
Vercel akan secara otomatis mendeteksi perubahan tersebut dan melakukan build ulang dalam hitungan detik.

---

### 6. Catatan Penting untuk SPA di Vercel

Project ini sudah dilengkapi file konfigurasi `vercel.json` dengan aturan rewrite:
```json
{
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Aturan ini memastikan tidak akan terjadi error **404 Not Found** saat pengguna me-refresh halaman pada rute manapun (misal: `/athlete/passbook`, `/admin/reports`).

---

### 7. Kredensial Default Awal
- **Admin**: `admin` / `admin123`
- Mode login atlet mendukung pencarian via **Username** atau **Angkatan / NIW** (contoh: `128/0089`).
