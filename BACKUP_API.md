# Backup & Restore API

## Overview

The backup and restore system allows users to export all their project data as JSON and import it back later. The system supports:

- Full project export with history
- Selective import with conflict resolution
- JSON blob download
- Metadata queries

## API Endpoints

### GET /api/backup

Export user data or get backup metadata.

**Query Parameters:**
- `userId` (required): The user ID to export data for
- `format` (optional): Output format - `json` (default) or `blob`
- `metadata` (optional): If `true`, returns only backup metadata (project count, last updated)

**Response (full export):**
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename="backup-{userId}-{timestamp}.json"`

**Response (metadata only):**
```json
{
  "projectCount": 10,
  "lastUpdated": 1704067200000
}
```

**Example:**
```bash
curl "http://localhost:3000/api/backup?userId=USER_ID&format=json" -o backup.json
```

### POST /api/backup/import

Import backup data from JSON.

**Query Parameters:**
- `userId` (required): The target user ID
- `onConflict` (optional): Conflict resolution strategy:
  - `rename` (default): Creates copy with new name if conflict exists
  - `skip`: Skips conflicting projects
  - `overwrite`: Overwrites existing projects

**Request Body:**
- Content-Type: `application/json` or `application/octet-stream`
- Body: Backup JSON data

**Response:**
```json
{
  "success": true,
  "imported": 5,
  "skipped": 0,
  "errors": []
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/backup/import?userId=USER_ID&onConflict=rename" \
  -H "Content-Type: application/json" \
  -d @backup.json
```

## Client Functions

### exportUserData(userId: string): Promise<Blob>

Exports all user data as a JSON blob.

```typescript
import { exportUserData } from '@/lib/projectActions'

const blob = await exportUserData(userId)
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `backup-${userId}.json`
a.click()
```

### getBackupMetadata(userId: string): Promise<{ projectCount: number; lastUpdated: number }>

Gets backup metadata without full export.

```typescript
import { getBackupMetadata } from '@/lib/projectActions'

const metadata = await getBackupMetadata(userId)
console.log(`Projects: ${metadata.projectCount}`)
console.log(`Last updated: ${new Date(metadata.lastUpdated).toISOString()}`)
```

### importUserData(userId: string, data: Blob | string, options?: { onConflict?: 'rename' | 'skip' | 'overwrite' }): Promise<{ imported: number; skipped: number; errors: string[] }>

Imports backup data from JSON blob or string.

```typescript
import { importUserData } from '@/lib/projectActions'

const result = await importUserData(userId, backupBlob, { onConflict: 'rename' })
console.log(`Imported: ${result.imported}`)
console.log(`Skipped: ${result.skipped}`)
if (result.errors.length > 0) {
  console.error('Errors:', result.errors)
}
```

## Backup Format

Exported data follows this schema:

```json
{
  "version": "1.0",
  "exportedAt": 1704067200000,
  "userId": "USER_ID",
  "projects": [
    {
      "id": "PROJECT_ID",
      "name": "Project Name",
      "code": "// source code",
      "nodes": [],
      "edges": [],
      "updatedAt": 1704067200000,
      "isDeleted": false,
      "deletedAt": null,
      "history": [
        {
          "id": "HISTORY_ID",
          "action": "create",
          "changedBy": "USER_ID",
          "changedAt": 1704067200000,
          "previousValues": null
        }
      ]
    }
  ]
}
```

## Conflict Resolution Strategies

### rename (Default)
If a project with the same ID exists:
- Creates a new project with modified ID (appends timestamp)
- Renames the project (appends "Import {timestamp}")
- Preserves all history

### skip
If a project with the same ID exists:
- Skips the project entirely
- Continues with remaining projects
- Counted in `skipped` field

### overwrite
If a project with the same ID exists:
- Replaces all project data
- Preserves project ID
- Adds new history entry for the import

## Error Handling

All functions throw errors with descriptive messages. Common errors:

- `Missing userId`: Required parameter not provided
- `Invalid onConflict value`: Unknown conflict strategy
- `Invalid JSON format`: Malformed backup data
- `Unsupported backup version`: Incompatible backup version
- `Backup user ID does not match`: User ID mismatch

## Limitations

- Maximum 1000 nodes per project
- Maximum 2000 edges per project
- Export includes all projects (no selective export yet)
- Import creates new history entries (original history preserved)

## Future Enhancements

- Selective export (specific projects)
- Import to different user account (admin only)
- Export with/without history
- Scheduled backup storage
