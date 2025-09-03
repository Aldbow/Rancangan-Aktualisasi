import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (search) {
      // Search PPK by query
      const ppkList = await googleSheetsService.searchPPK(search)
      return NextResponse.json(ppkList)
    } else {
      // Get all PPK
      const ppkList = await googleSheetsService.getPPK()
      return NextResponse.json(ppkList)
    }
  } catch (error) {
    console.error('Error in PPK API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PPK data' },
      { status: 500 }
    )
  }
}
