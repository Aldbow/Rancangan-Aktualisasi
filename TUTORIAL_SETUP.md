# Tutorial Setup - Sistem Penilaian Penyedia LKPP

Panduan lengkap untuk mengakses dan menjalankan aplikasi Sistem Penilaian Penyedia LKPP di device yang berbeda.

## 📋 Prerequisites

Sebelum memulai, pastikan device Anda memiliki:

### Software yang Diperlukan
- **Node.js** (versi 18.0 atau lebih baru)
- **npm** atau **yarn** (package manager)
- **Git** (untuk clone repository)
- **Text Editor** (VS Code, Sublime Text, dll.)

### Akun yang Diperlukan
- **GitHub Account** (untuk akses repository)
- **Google Cloud Account** (untuk Google Sheets API)
- **Vercel Account** (opsional, untuk deployment)

## 🚀 Langkah-langkah Setup

### 1. Clone Repository

```bash
# Clone repository dari GitHub
git clone https://github.com/[username]/lkpp-penyedia-rating.git

# Masuk ke direktori project
cd lkpp-penyedia-rating
```

### 2. Install Dependencies

```bash
# Install semua dependencies
npm install

# Atau jika menggunakan yarn
yarn install
```

### 3. Setup Environment Variables

#### a. Copy file environment
```bash
# Copy .env.example menjadi .env.local
cp .env.example .env.local
```

#### b. Konfigurasi Google Sheets API

1. **Buat Google Cloud Project:**
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih project yang sudah ada
   - Enable Google Sheets API

2. **Buat Service Account:**
   - Pergi ke IAM & Admin > Service Accounts
   - Klik "Create Service Account"
   - Berikan nama dan deskripsi
   - Download file JSON credentials

3. **Setup Google Sheet:**
   - Buat Google Sheet baru
   - Share sheet dengan email service account (dengan akses Editor)
   - Copy Sheet ID dari URL

4. **Update .env.local:**
```env
# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PRIVATE_KEY_DARI_JSON_FILE]\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@project-id.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="1ABC123DEF456GHI789JKL"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-string-here"
```

### 4. Setup Database Structure

Buat 2 sheet di Google Spreadsheet dengan struktur berikut:

#### Sheet 1: "Penyedia"
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID Penyedia | Nama Perusahaan | NPWP | Alamat | Kontak | Jenis Usaha | Tanggal Registrasi |

#### Sheet 2: "Penilaian"
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| ID Penilaian | ID Penyedia | Nama PPK | Email PPK | Tanggal Penilaian | Kriteria | Skor Total | Keterangan |

### 5. Jalankan Aplikasi

```bash
# Development mode
npm run dev

# Atau dengan yarn
yarn dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔧 Commands Penting

```bash
# Development
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run start        # Jalankan production server
npm run lint         # Check code quality

# Git commands
git pull origin main # Update code terbaru
git status          # Check status perubahan
git add .           # Stage semua perubahan
git commit -m "msg" # Commit perubahan
git push origin main # Push ke GitHub
```

## 🌐 Deployment ke Vercel

### 1. Setup Vercel Account
- Daftar di [vercel.com](https://vercel.com)
- Connect dengan GitHub account

### 2. Deploy Project
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy project
vercel --prod
```

### 3. Setup Environment Variables di Vercel
- Buka Vercel dashboard
- Pilih project Anda
- Pergi ke Settings > Environment Variables
- Tambahkan semua variable dari .env.local

## 📱 Akses dari Device Lain

### Option 1: Development Server
```bash
# Jalankan dengan network access
npm run dev -- --hostname 0.0.0.0

# Akses dari device lain di network yang sama
# http://[IP_ADDRESS]:3000
```

### Option 2: Production Deployment
- Deploy ke Vercel (gratis)
- Akses melalui URL yang diberikan Vercel
- Contoh: `https://lkpp-penyedia-rating.vercel.app`

## 🔒 Security Checklist

- ✅ File `.env.local` tidak di-commit ke Git
- ✅ Service account JSON tidak di-commit
- ✅ Environment variables aman di Vercel
- ✅ Google Sheet hanya accessible oleh service account
- ✅ NEXTAUTH_SECRET menggunakan string random yang kuat

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Error: "Google Sheets API"
- Pastikan Google Sheets API sudah enabled
- Cek format GOOGLE_SHEETS_PRIVATE_KEY (harus ada \n)
- Pastikan service account punya akses ke sheet

### Error: "Port 3000 already in use"
```bash
# Gunakan port lain
npm run dev -- --port 3001
```

### Error: Build failed
```bash
# Check TypeScript errors
npm run lint
npx tsc --noEmit
```

## 📞 Support

Jika mengalami masalah:
1. Check error message di console
2. Pastikan semua environment variables sudah benar
3. Cek network connection untuk API calls
4. Review Google Cloud Console untuk API usage

## 🔄 Update Project

```bash
# Pull latest changes
git pull origin main

# Install new dependencies (jika ada)
npm install

# Restart development server
npm run dev
```

---

**Catatan:** Simpan file ini dan credentials dengan aman. Jangan share environment variables atau service account credentials ke orang lain.
