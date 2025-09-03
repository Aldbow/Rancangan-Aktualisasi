# Sistem Penilaian Penyedia LKPP

Sistem penilaian penyedia barang/jasa yang terintegrasi dengan Google Spreadsheet untuk memudahkan PPK dalam memberikan penilaian terhadap penyedia.

## Fitur Utama

- 📊 Database Google Spreadsheet untuk menyimpan data penyedia dan penilaian
- 🔍 Pencarian penyedia dengan fitur search yang cepat
- 📝 Form penilaian sesuai kriteria LKPP
- 👥 Multiple PPK dapat menilai satu penyedia
- 📱 Responsive design dengan UI modern
- 🌐 Dapat diakses online secara gratis

## Struktur Database

### Sheet 1: Penyedia
- ID Penyedia
- Nama Perusahaan
- NPWP
- Alamat
- Kontak
- Jenis Usaha
- Tanggal Registrasi

### Sheet 2: Penilaian
- ID Penilaian
- ID Penyedia
- Nama PPK
- Email PPK
- Tanggal Penilaian
- Kriteria Penilaian (sesuai LKPP)
- Skor Total
- Keterangan

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: Google Sheets API
- **Deployment**: Vercel (gratis)
- **Authentication**: Google OAuth (opsional)

## Cara Setup dan Deploy

Lihat dokumentasi lengkap di bawah untuk setup dan deployment.
