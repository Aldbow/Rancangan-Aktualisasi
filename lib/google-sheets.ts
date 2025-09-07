import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Interface untuk data penyedia
export interface Penyedia {
  id: string;
  namaPerusahaan: string;
  npwp: string;
  alamat: string;
  kontak: string;
  jenisUsaha: string;
  tanggalRegistrasi: string;
}

// Interface untuk data PPK
export interface PPK {
  no: string;
  eselonI: string;
  satuanKerja: string;
  ta: string;
  nama: string;
  nip: string;
  noHp: string;
}

// Interface untuk data penilaian
export interface Penilaian {
  id: string;
  idPenyedia: string;
  namaPPK: string;
  tanggalPenilaian: string;
  kualitasKuantitasBarangJasa: number;
  komentarKualitasKuantitasBarangJasa: string;
  biaya: number;
  komentarBiaya: string;
  waktu: number;
  komentarWaktu: string;
  layanan: number;
  komentarLayanan: string;
  penilaianAkhir: string;
  skorTotal: number;
  keterangan: string;
}

class GoogleSheetsService {
  private auth: any;
  private sheets: any;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      // Validate environment variables
      const hasPrivateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_SHEETS_PRIVATE_KEY_BASE64;
      if (!hasPrivateKey || !process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
        throw new Error('Missing required Google Sheets environment variables');
      }

      // Handle private key - support both direct and base64 encoded
      let privateKey: string;
      
      if (process.env.GOOGLE_SHEETS_PRIVATE_KEY_BASE64) {
        // Decode from base64
        privateKey = Buffer.from(process.env.GOOGLE_SHEETS_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
        console.log('Using base64 encoded private key');
      } else if (process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
        // Use direct private key
        privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
        
        // Remove quotes if present
        privateKey = privateKey.replace(/^["']|["']$/g, '');
        
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        console.log('Using direct private key');
      } else {
        throw new Error('No private key found in environment variables');
      }
      
      // Validate private key format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
        throw new Error('Invalid private key format. Must include BEGIN and END markers.');
      }

      // Validate private key length (should be substantial)
      if (privateKey.length < 1000) {
        throw new Error(`Private key seems too short (${privateKey.length} chars). Please check if the key is complete.`);
      }

      console.log('Initializing Google Sheets auth...');
      console.log('Client email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
      console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);
      console.log('Private key length:', privateKey.length, 'characters');
      
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          private_key: privateKey,
        },
        scopes: SCOPES,
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Test the connection
      await this.testConnection();
      console.log('Google Sheets auth initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Google Sheets auth:', error);
      throw error;
    }
  }

  // Test connection method
  private async testConnection() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
      });
      console.log('Connection test successful. Spreadsheet title:', response.data.properties?.title);
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new Error('Failed to connect to Google Sheets. Please check your credentials and sheet ID.');
    }
  }

  // Mendapatkan semua data penyedia
  async getPenyedia(): Promise<Penyedia[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penyedia!A2:G', // Mulai dari baris 2 (skip header)
      });

      const rows = response.data.values || [];
      return rows.map((row: any[]) => ({
        id: row[0] || '',
        namaPerusahaan: row[1] || '',
        npwp: row[2] || '',
        alamat: row[3] || '',
        kontak: row[4] || '',
        jenisUsaha: row[5] || '',
        tanggalRegistrasi: row[6] || '',
      }));
    } catch (error) {
      console.error('Error getting penyedia data:', error);
      throw error;
    }
  }

  // Mencari penyedia berdasarkan nama
  async searchPenyedia(query: string): Promise<Penyedia[]> {
    const allPenyedia = await this.getPenyedia();
    return allPenyedia.filter(penyedia => 
      penyedia.namaPerusahaan.toLowerCase().includes(query.toLowerCase()) ||
      penyedia.npwp.includes(query)
    );
  }

  // Menambah penyedia baru
  async addPenyedia(penyedia: Omit<Penyedia, 'id'>): Promise<void> {
    try {
      const id = `PYD${Date.now()}`;
      const values = [[
        id,
        penyedia.namaPerusahaan,
        penyedia.npwp,
        penyedia.alamat,
        penyedia.kontak,
        penyedia.jenisUsaha,
        penyedia.tanggalRegistrasi
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penyedia!A:G',
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (error) {
      console.error('Error adding penyedia:', error);
      throw error;
    }
  }

  // Mendapatkan semua data PPK
  async getPPK(): Promise<PPK[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PPK!A2:G', // Mulai dari baris 2 (skip header)
      });

      const rows = response.data.values || [];
      return rows.map((row: any[]) => ({
        no: row[0] || '',
        eselonI: row[1] || '',
        satuanKerja: row[2] || '',
        ta: row[3] || '',
        nama: row[4] || '',
        nip: row[5] || '',
        noHp: row[6] || '',
      }));
    } catch (error) {
      console.error('Error getting PPK data:', error);
      throw error;
    }
  }

  // Mencari PPK berdasarkan nama atau NIP
  async searchPPK(query: string): Promise<PPK[]> {
    const allPPK = await this.getPPK();
    return allPPK.filter(ppk => 
      ppk.nama.toLowerCase().includes(query.toLowerCase()) ||
      ppk.nip.includes(query) ||
      ppk.satuanKerja.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Mendapatkan semua penilaian
  async getPenilaian(): Promise<Penilaian[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penilaian!A2:O', // Updated range to include comment columns
      });

      const rows = response.data.values || [];
      return rows.map((row: any[]) => ({
        id: row[0] || '',
        idPenyedia: row[1] || '',
        namaPPK: row[2] || '',
        tanggalPenilaian: row[3] || '',
        kualitasKuantitasBarangJasa: parseFloat(row[4]) || 0,
        komentarKualitasKuantitasBarangJasa: row[5] || '',
        biaya: parseFloat(row[6]) || 0,
        komentarBiaya: row[7] || '',
        waktu: parseFloat(row[8]) || 0,
        komentarWaktu: row[9] || '',
        layanan: parseFloat(row[10]) || 0,
        komentarLayanan: row[11] || '',
        penilaianAkhir: row[12] || '',
        skorTotal: parseFloat(row[13]) || 0,
        keterangan: row[14] || '',
      }));
    } catch (error) {
      console.error('Error getting penilaian data:', error);
      throw error;
    }
  }

  // Menambah penilaian baru
  async addPenilaian(penilaian: Omit<Penilaian, 'id' | 'skorTotal' | 'penilaianAkhir'>): Promise<void> {
    try {
      const id = `PNL${Date.now()}`;
      
      // Hitung skor total berdasarkan bobot LKPP:
      // Kualitas dan kuantitas: 30%, Biaya: 20%, Waktu: 30%, Layanan: 20%
      const skorTotal = (
        (penilaian.kualitasKuantitasBarangJasa * 0.3) +
        (penilaian.biaya * 0.2) +
        (penilaian.waktu * 0.3) +
        (penilaian.layanan * 0.2)
      );

      // Tentukan penilaian akhir berdasarkan skor total
      let penilaianAkhir: string;
      if (skorTotal === 0) {
        penilaianAkhir = 'Buruk';
      } else if (skorTotal >= 1 && skorTotal < 2) {
        penilaianAkhir = 'Cukup';
      } else if (skorTotal >= 2 && skorTotal < 3) {
        penilaianAkhir = 'Baik';
      } else if (skorTotal === 3) {
        penilaianAkhir = 'Sangat Baik';
      } else {
        penilaianAkhir = 'Cukup'; // fallback
      }

      const values = [[
        id,
        penilaian.idPenyedia,
        penilaian.namaPPK,
        penilaian.tanggalPenilaian,
        penilaian.kualitasKuantitasBarangJasa,
        penilaian.komentarKualitasKuantitasBarangJasa,
        penilaian.biaya,
        penilaian.komentarBiaya,
        penilaian.waktu,
        penilaian.komentarWaktu,
        penilaian.layanan,
        penilaian.komentarLayanan,
        penilaianAkhir,
        skorTotal,
        penilaian.keterangan
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penilaian!A:O',
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (error) {
      console.error('Error adding penilaian:', error);
      throw error;
    }
  }

  // Mendapatkan penilaian berdasarkan ID penyedia
  async getPenilaianByPenyedia(idPenyedia: string): Promise<Penilaian[]> {
    const allPenilaian = await this.getPenilaian();
    return allPenilaian.filter(penilaian => penilaian.idPenyedia === idPenyedia);
  }

  // Optimized search method that combines penyedia with ratings
  async searchPenyediaWithRatings(query: string): Promise<any[]> {
    try {
      // Get both penyedia and penilaian data in parallel
      const [penyediaList, penilaianList] = await Promise.all([
        this.searchPenyedia(query),
        this.getPenilaian()
      ]);

      // Combine data efficiently
      const results = penyediaList.map(penyedia => {
        const penilaianPenyedia = penilaianList.filter(pnl => pnl.idPenyedia === penyedia.id);
        const totalPenilaian = penilaianPenyedia.length;
        const rataRataSkor = totalPenilaian > 0 
          ? penilaianPenyedia.reduce((sum, pnl) => sum + pnl.skorTotal, 0) / totalPenilaian
          : 0;

        return {
          ...penyedia,
          totalPenilaian,
          rataRataSkor,
          penilaian: penilaianPenyedia
        };
      });

      // Sort by rating (highest first) and limit results for performance
      return results
        .sort((a, b) => b.rataRataSkor - a.rataRataSkor)
        .slice(0, 20); // Limit to top 20 results
    } catch (error) {
      console.error('Error searching penyedia with ratings:', error);
      throw error;
    }
  }

  // Inisialisasi spreadsheet dengan header jika belum ada
  async initializeSpreadsheet(): Promise<void> {
    try {
      // Header untuk sheet Penyedia
      const penyediaHeaders = [
        'ID Penyedia', 'Nama Perusahaan', 'NPWP', 'Alamat', 
        'Kontak', 'Jenis Usaha', 'Tanggal Registrasi'
      ];

      // Header untuk sheet PPK
      const ppkHeaders = [
        'No', 'Eselon I', 'Satuan Kerja', 'TA', 'Nama', 'NIP', 'No. HP'
      ];

      // Header untuk sheet Penilaian
      const penilaianHeaders = [
        'ID Penilaian', 'ID Penyedia', 'Nama PPK', 'Tanggal Penilaian',
        'Kualitas dan KuantitasBarang/Jasa', 'Komentar Kualitas dan KuantitasBarang/Jasa',
        'Biaya', 'Komentar Biaya', 'Waktu', 'Komentar Waktu',
        'Layanan', 'Komentar Layanan', 'Penilaian Akhir', 'Skor Total', 'Keterangan'
      ];

      // Cek apakah header sudah ada, jika belum tambahkan
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penyedia!A1:G1',
        valueInputOption: 'RAW',
        resource: { values: [penyediaHeaders] },
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'PPK!A1:G1',
        valueInputOption: 'RAW',
        resource: { values: [ppkHeaders] },
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Penilaian!A1:O1',
        valueInputOption: 'RAW',
        resource: { values: [penilaianHeaders] },
      });

    } catch (error) {
      console.error('Error initializing spreadsheet:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
