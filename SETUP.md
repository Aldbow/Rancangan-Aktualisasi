# Panduan Setup Sistem Penilaian Penyedia LKPP

## Langkah 1: Setup Google Sheets

### 1.1 Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "Database Penyedia LKPP"
3. Buat 2 sheet dengan nama:
   - `Penyedia`
   - `Penilaian`

### 1.2 Setup Google Service Account
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google Sheets API:
   - Pergi ke "APIs & Services" > "Library"
   - Cari "Google Sheets API" dan aktifkan
4. Buat Service Account:
   - Pergi ke "APIs & Services" > "Credentials"
   - Klik "Create Credentials" > "Service Account"
   - Isi nama service account (contoh: "lkpp-sheets-service")
   - Klik "Create and Continue"
   - Skip role assignment (klik "Continue")
   - Klik "Done"
5. Generate Private Key:
   - Klik pada service account yang baru dibuat
   - Pergi ke tab "Keys"
   - Klik "Add Key" > "Create New Key"
   - Pilih format JSON dan download

### 1.3 Share Spreadsheet dengan Service Account
1. Buka file JSON yang didownload
2. Copy email dari field `client_email`
3. Buka Google Spreadsheet yang dibuat di langkah 1.1
4. Klik "Share" dan tambahkan email service account dengan permission "Editor"

## Langkah 2: Setup Environment Variables

1. Copy file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` dengan data dari service account JSON:
```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_PRIVATE_KEY_DARI_JSON\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="email-service-account@project-id.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="ID_SPREADSHEET_DARI_URL"
```

**Cara mendapatkan Google Sheet ID:**
- Buka spreadsheet di browser
- URL akan terlihat seperti: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- Copy bagian `SHEET_ID`

## Langkah 3: Install Dependencies

```bash
npm install
```

## Langkah 4: Inisialisasi Database

1. Jalankan development server:
```bash
npm run dev
```

2. Buka browser dan akses: `http://localhost:3000`

3. Inisialisasi spreadsheet dengan mengakses:
```
POST http://localhost:3000/api/init
```

Atau gunakan curl:
```bash
curl -X POST http://localhost:3000/api/init
```

## Langkah 5: Testing

1. Buka aplikasi di `http://localhost:3000`
2. Coba tambah penyedia baru melalui halaman penilaian
3. Berikan penilaian untuk penyedia
4. Cek laporan di halaman laporan
5. Verifikasi data tersimpan di Google Spreadsheet

## Troubleshooting

### Error: "Unable to parse private key"
- Pastikan private key dalam format yang benar dengan `\n` untuk line breaks
- Gunakan double quotes untuk environment variable

### Error: "The caller does not have permission"
- Pastikan service account email sudah di-share ke spreadsheet
- Pastikan Google Sheets API sudah diaktifkan

### Error: "Spreadsheet not found"
- Pastikan Google Sheet ID benar
- Pastikan spreadsheet dapat diakses oleh service account

## Struktur Data

### Sheet "Penyedia"
| Kolom | Deskripsi |
|-------|-----------|
| A | ID Penyedia |
| B | Nama Perusahaan |
| C | NPWP |
| D | Alamat |
| E | Kontak |
| F | Jenis Usaha |
| G | Tanggal Registrasi |

### Sheet "Penilaian"
| Kolom | Deskripsi |
|-------|-----------|
| A | ID Penilaian |
| B | ID Penyedia |
| C | Nama PPK |
| D | Tanggal Penilaian |
| E | Kualitas dan Kuantitas Barang/Jasa (1-5) |
| F | Biaya (1-5) |
| G | Waktu (1-5) |
| H | Layanan (1-5) |
| I | Penilaian Akhir |
| J | Skor Total |
| K | Keterangan |
