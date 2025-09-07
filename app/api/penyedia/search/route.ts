import { NextRequest, NextResponse } from 'next/server';
import { googleSheetsService } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    // Get search results with ratings in a single optimized call
    const searchResults = await googleSheetsService.searchPenyediaWithRatings(query);
    
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Error searching penyedia:', error);
    return NextResponse.json(
      { error: 'Gagal mencari data penyedia' },
      { status: 500 }
    );
  }
}
