import { NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/google-sheets'

export async function GET() {
  try {
    // Get all PPK data
    const allPPK = await googleSheetsService.getPPK()
    
    // Extract unique Eselon I values
    const eselonISet = new Set<string>()
    const satuanKerjaSet = new Set<string>()
    
    allPPK.forEach(ppk => {
      if (ppk.eselonI && ppk.eselonI.trim()) {
        eselonISet.add(ppk.eselonI.trim())
      }
      if (ppk.satuanKerja && ppk.satuanKerja.trim()) {
        satuanKerjaSet.add(ppk.satuanKerja.trim())
      }
    })

    // Convert to sorted arrays
    const eselonIOptions = Array.from(eselonISet)
      .sort()
      .map(value => ({ value, label: value }))
    
    const satuanKerjaOptions = Array.from(satuanKerjaSet)
      .sort()
      .map(value => ({ value, label: value }))

    return NextResponse.json({
      eselonI: eselonIOptions,
      satuanKerja: satuanKerjaOptions
    })

  } catch (error) {
    console.error('Error fetching PPK options:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data PPK' },
      { status: 500 }
    )
  }
}
