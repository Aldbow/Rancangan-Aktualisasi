import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search');

    if (query) {
      const penyedia = await googleSheetsService.searchPenyedia(query);
      return NextResponse.json(penyedia);
    } else {
      const penyedia = await googleSheetsService.getPenyedia();
      return NextResponse.json(penyedia);
    }
  } catch (error) {
    console.error('Error fetching penyedia:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data penyedia' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await googleSheetsService.addPenyedia(body);
    return NextResponse.json({ message: 'Penyedia berhasil ditambahkan' });
  } catch (error) {
    console.error('Error adding penyedia:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan penyedia' },
      { status: 500 }
    );
  }
}
