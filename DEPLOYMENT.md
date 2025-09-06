# Panduan Deployment

## Persiapan Deployment

### 1. Push ke GitHub
```bash
# Inisialisasi git repository (jika belum ada)
git init
git add .
git commit -m "Initial commit: Sistem Penilaian Penyedia LKPP"

# Buat repository baru di GitHub, lalu push
git remote add origin https://github.com/username/repository-name.git
git branch -M main
git push -u origin main
```

### 2. Deploy ke Vercel

#### Opsi 1: Melalui Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy ke production
vercel --prod
```

#### Opsi 2: Melalui Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub Anda.
3. Klik "New Project".
4. Import repository GitHub yang sudah Anda siapkan.
5. Konfigurasi pengaturan proyek:
   - Framework Preset: **Next.js** (biasanya terdeteksi otomatis)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Setup Environment Variables di Vercel

1. Di dashboard Vercel, buka pengaturan proyek Anda.
2. Pergi ke tab "Environment Variables".
3. Tambahkan variabel berikut sesuai dengan isi file `.env.example` Anda:

```
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_PRIVATE_KEY_ANDA\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="your_sheet_id_here"
```

**Penting:** Untuk `GOOGLE_SHEETS_PRIVATE_KEY`, pastikan:
- Gunakan tanda kutip ganda (`"`).
- Ganti semua baris baru (line break) dari file key `.json` Anda dengan karakter `\n`.
- Sertakan `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`.

### 4. Redeploy
Setelah menambahkan environment variables, trigger redeploy agar perubahan diterapkan:
- Buka tab "Deployments".
- Klik tombol "Redeploy" pada deployment terbaru.

## Alternatif Platform Deployment

### 1. Netlify
1. Buka [netlify.com](https://netlify.com) dan login.
2. Klik "Add new site" -> "Import an existing project".
3. Hubungkan dengan provider Git Anda (GitHub, GitLab, dll.).
4. Pilih repository proyek Anda.
5. Netlify akan otomatis mendeteksi bahwa ini adalah proyek Next.js dan mengisi pengaturan build.
6. Tambahkan Environment Variables Anda di pengaturan situs.
7. Klik "Deploy site".

### 2. Railway
1. Buka [railway.app](https://railway.app).
2. Hubungkan dengan repository GitHub Anda.
3. Tambahkan environment variables dari dashboard Railway.
4. Deployment akan berjalan secara otomatis.

### 3. Render
1. Buka [render.com](https://render.com).
2. Buat "New Web Service" baru.
3. Hubungkan dengan repository GitHub Anda.
4. Atur Build Command: `npm run build`.
5. Atur Start Command: `npm start`.
6. Tambahkan environment variables.

## Konfigurasi Pasca-Deployment

### 1. Inisialisasi Database
Setelah deployment berhasil, jalankan inisialisasi database dengan mengakses endpoint berikut (misalnya menggunakan Postman atau `curl`):
```
POST https://your-app-url.vercel.app/api/init
```

### 2. Test Aplikasi
1. Buka aplikasi pada URL yang telah disediakan Vercel.
2. Lakukan tes pada semua fitur utama:
   - Pencarian penyedia
   - Pengisian form penilaian
   - Tampilan laporan
3. Verifikasi bahwa data baru berhasil tersimpan di Google Spreadsheet Anda.

### 3. Custom Domain (Opsional)
Di dashboard Vercel:
1. Buka tab "Domains".
2. Tambahkan custom domain yang Anda miliki.
3. Ikuti instruksi untuk mengupdate DNS records di provider domain Anda.

## Monitoring dan Maintenance

### 1. Monitoring
- Gunakan Vercel Analytics untuk memantau performa dan traffic.
- Periksa log Vercel Functions untuk debugging jika terjadi error pada API.
- Pantau kuota penggunaan Google Sheets API di Google Cloud Console.

### 2. Backup Data
- Lakukan export data dari Google Spreadsheet secara berkala.
- Simpan file backup di lokasi yang aman (misal: cloud storage).

### 3. Updates
```bash
# Pull perubahan terbaru dari remote (jika bekerja dalam tim)
git pull origin main

# Update dependencies (gunakan dengan hati-hati)
# Perintah ini dapat mengupdate package ke versi yang memiliki breaking changes.
npm update

# Test aplikasi secara lokal
npm run dev

# Push perubahan ke GitHub
git add .
git commit -m "Update dependencies"
git push

# Vercel akan otomatis melakukan redeploy setelah mendeteksi push baru.
```

## Troubleshooting Umum

### Error: "Module not found"
Masalah ini sering terjadi karena ketidaksesuaian dependencies.
```bash
# Hapus node_modules dan package-lock.json lalu install ulang.

# Untuk macOS/Linux:
rm -rf node_modules package-lock.json

# Untuk Windows (Command Prompt):
rd /s /q node_modules
del package-lock.json

# Install ulang dependencies
npm install
```

### Error: "Environment variable not found"
- Pastikan semua environment variables yang dibutuhkan sudah diatur di Vercel.
- Ingat untuk melakukan **redeploy** setelah menambah atau mengubah environment variables.

### Error: "Google Sheets API quota exceeded"
- Periksa penggunaan API di Google Cloud Console.
- Pertimbangkan untuk mengimplementasikan caching pada sisi server untuk mengurangi jumlah request.
- Jika perlu, ajukan peningkatan kuota atau upgrade plan Google Cloud Anda.

### Error: "Build failed"
- Periksa log build di dashboard Vercel untuk pesan error yang spesifik.
- Pastikan semua dependencies yang dibutuhkan untuk build ada di `package.json` (`dependencies`, bukan `devDependencies` jika dibutuhkan saat runtime).
- Coba jalankan build secara lokal untuk memastikan tidak ada error: `npm run build`.

## Praktik Terbaik Keamanan

1. **Environment Variables**: Jangan pernah menyimpan file `.env` atau kredensial sensitif lainnya di dalam Git repository. Gunakan `.gitignore` untuk mengabaikannya.
2. **Service Account**: Berikan izin (permissions) seminimal mungkin yang diperlukan oleh service account Google Anda.
3. **CORS**: Konfigurasi Cross-Origin Resource Sharing (CORS) dengan benar jika API Anda perlu diakses dari domain lain.
4. **Rate Limiting**: Pertimbangkan untuk menerapkan rate limiting pada API endpoints untuk mencegah penyalahgunaan (abuse).
5. **Validasi Input**: Selalu lakukan validasi dan sanitasi semua input yang berasal dari pengguna untuk mencegah serangan seperti XSS atau injection.

## Pertimbangan Skalabilitas

Jika aplikasi Anda berkembang dan traffic meningkat:
1. **Database**: Pertimbangkan untuk migrasi dari Google Sheets ke database yang lebih robust seperti PostgreSQL, MongoDB, atau Firebase.
2. **Authentication**: Implementasikan sistem autentikasi pengguna yang proper (misal: NextAuth.js, Clerk).
3. **Caching**: Gunakan layer caching (seperti Redis) untuk data yang sering diakses.
4. **CDN**: Manfaatkan Vercel Edge Network atau CDN eksternal seperti Cloudflare untuk distribusi aset global.
5. **Monitoring**: Implementasikan tools logging dan monitoring yang lebih canggih (misal: Sentry, Datadog).