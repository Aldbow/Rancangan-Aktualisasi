import { NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function POST() {
  try {
    await googleSheetsService.initializeSpreadsheet();
    return NextResponse.json({ message: 'Spreadsheet berhasil diinisialisasi' });
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
    return NextResponse.json(
      { error: 'Gagal menginisialisasi spreadsheet' },
      { status: 500 }
    );
  }
}
