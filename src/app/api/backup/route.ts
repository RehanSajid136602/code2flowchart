import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getBackupMetadata, exportUserDataAsJson, exportUserDataAsBlob } from '../../../lib/backup'
import { requireAuthWithUserId, createUnauthorizedResponse, createForbiddenResponse } from '@/lib/authMiddleware'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const format = url.searchParams.get('format') || 'json'
    const metadataOnly = url.searchParams.get('metadata') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    await requireAuthWithUserId(request, userId)

    if (metadataOnly) {
      const metadata = await getBackupMetadata(userId)
      return NextResponse.json(metadata)
    }

    if (format === 'blob') {
      const blob = await exportUserDataAsBlob(userId)
      return new NextResponse(blob, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="backup-${userId}-${Date.now()}.json"`,
        },
      })
    }

    const json = await exportUserDataAsJson(userId)
    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${userId}-${Date.now()}.json"`,
      },
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse()
    }
    if (err.message === 'FORBIDDEN_USER_MISMATCH') {
      return createForbiddenResponse('You can only backup your own data')
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
