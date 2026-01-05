import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { importUserDataFromJson, importUserDataFromBlob, validateBackupData } from '../../../../lib/backup'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const onConflict = url.searchParams.get('onConflict') || 'rename'

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    if (!['rename', 'skip', 'overwrite'].includes(onConflict)) {
      return NextResponse.json({ error: 'Invalid onConflict value. Use rename, skip, or overwrite' }, { status: 400 })
    }

    const contentType = request.headers.get('content-type') || ''

    let result: { imported: number; skipped: number; errors: string[] }

    if (contentType.includes('application/json')) {
      const body = await request.json()

      if (!validateBackupData(body)) {
        return NextResponse.json({ error: 'Invalid backup data format' }, { status: 400 })
      }

      result = await importUserDataFromJson(userId, JSON.stringify(body), { onConflict: onConflict as 'rename' | 'skip' | 'overwrite' })
    } else if (contentType.includes('application/octet-stream') || contentType.includes('text/')) {
      const blob = await request.blob()
      result = await importUserDataFromBlob(userId, blob, { onConflict: onConflict as 'rename' | 'skip' | 'overwrite' })
    } else {
      return NextResponse.json({ error: 'Unsupported content type. Use application/json or application/octet-stream' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
