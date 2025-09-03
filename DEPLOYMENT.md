# Panduan Deployment ke Vercel

## Persiapan Deployment

### 1. Push ke GitHub
```bash
# Inisialisasi git repository
git init
git add .
git commit -m "Initial commit: Sistem Penilaian Penyedia LKPP"

# Push ke GitHub (buat repository baru di GitHub terlebih dahulu)
git remote add origin https://github.com/username/lkpp-penyedia-rating.git
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

# Deploy
vercel --prod
```

#### Opsi 2: Melalui Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub account
3. Klik "New Project"
4. Import repository GitHub Anda
5. Configure project settings:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Setup Environment Variables di Vercel

1. Di Vercel dashboard, buka project settings
2. Pergi ke tab "Environment Variables"
3. Tambahkan variable berikut:

```
GOOGLE_SHEETS_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nISI_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL = "service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEET_ID = "your_sheet_id_here"
```

**Penting:** Untuk `GOOGLE_SHEETS_PRIVATE_KEY`, pastikan:
- Gunakan double quotes
- Ganti semua line break dengan `\n`
- Include `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`

### 4. Redeploy
Setelah menambahkan environment variables, trigger redeploy:
- Klik "Deployments" tab
- Klik "Redeploy" pada deployment terbaru

## Alternatif Deployment Gratis Lainnya

### 1. Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

### 2. Railway
1. Buka [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy otomatis

### 3. Render
1. Buka [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm run build`
5. Set start command: `npm start`

## Post-Deployment Setup

### 1. Inisialisasi Database
Setelah deployment berhasil, akses endpoint berikut untuk setup database:
```
POST https://your-app-url.vercel.app/api/init
```

### 2. Test Aplikasi
1. Buka aplikasi di URL yang diberikan
2. Test semua fitur:
   - Pencarian penyedia
   - Form penilaian
   - Laporan
3. Verifikasi data tersimpan di Google Spreadsheet

### 3. Custom Domain (Opsional)
Di Vercel dashboard:
1. Pergi ke tab "Domains"
2. Tambahkan custom domain
3. Update DNS records sesuai instruksi

## Monitoring dan Maintenance

### 1. Monitoring
- Gunakan Vercel Analytics untuk monitoring performa
- Check Vercel Functions logs untuk debugging
- Monitor Google Sheets API quota usage

### 2. Backup Data
- Export data dari Google Spreadsheet secara berkala
- Simpan backup di cloud storage

### 3. Updates
```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Push changes
git add .
git commit -m "Update dependencies"
git push

# Vercel akan otomatis redeploy
```

## Troubleshooting Deployment

### Error: "Module not found"
```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Environment variable not found"
- Pastikan semua environment variables sudah diset di Vercel
- Redeploy setelah menambah environment variables

### Error: "Google Sheets API quota exceeded"
- Monitor usage di Google Cloud Console
- Implement caching jika diperlukan
- Consider upgrading Google Cloud plan

### Error: "Build failed"
- Check build logs di Vercel dashboard
- Pastikan semua dependencies ada di package.json
- Test build locally: `npm run build`

## Security Best Practices

1. **Environment Variables**: Jangan commit file `.env` ke repository
2. **Service Account**: Berikan minimal permissions yang diperlukan
3. **CORS**: Implement CORS headers jika diperlukan
4. **Rate Limiting**: Consider implementing rate limiting untuk API endpoints
5. **Input Validation**: Validate semua input dari user

## Scaling Considerations

Jika aplikasi berkembang:
1. **Database**: Pertimbangkan migrasi ke database yang lebih robust (PostgreSQL, MongoDB)
2. **Authentication**: Implement proper user authentication
3. **Caching**: Add Redis caching layer
4. **CDN**: Use Vercel Edge Network atau CloudFlare
5. **Monitoring**: Implement proper logging dan monitoring tools
