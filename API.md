# API Reference

## Base URL

All API endpoints are relative to the server root. In development:
```
http://localhost:3000
```

## Authentication

All endpoints require a `userId` query parameter. The userId should match the authenticated Firebase user. Future versions will use JWT-based authentication.

## Response Format

All responses use JSON format.

**Success Response:**
```json
{
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Descriptive error message"
}
```

**Validation Error (422):**
```json
{
  "error": "Validation error",
  "details": { ... }
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing parameters)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Projects API

### GET /api/projects

List all projects for a user with pagination.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |
| limit | number | No | Number of projects to return (default: 20) |
| cursor | number | No | Pagination cursor (timestamp) |

**Response:**
```json
{
  "projects": [
    {
      "id": "project_123",
      "name": "My Flowchart",
      "code": "// source code",
      "nodes": [...],
      "edges": [...],
      "updatedAt": 1704067200000,
      "isDeleted": false
    }
  ],
  "nextCursor": 1704067199000
}
```

**Example:**
```bash
curl "http://localhost:3000/api/projects?userId=USER_ID&limit=10"
```

---

### POST /api/projects

Create a new project.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Request Body:**
```json
{
  "project": {
    "id": "auto_generated",
    "name": "Project Name",
    "code": "// source code",
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response (201):**
```json
{
  "id": "project_123",
  "name": "Project Name",
  "code": "// source code",
  "nodes": [...],
  "edges": [...],
  "updatedAt": 1704067200000,
  "isDeleted": false
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/projects?userId=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"project": {...}}'
```

---

### GET /api/projects/[id]

Get a single project.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "id": "project_123",
  "name": "My Flowchart",
  "code": "// source code",
  "nodes": [...],
  "edges": [...],
  "updatedAt": 1704067200000,
  "isDeleted": false
}
```

---

### PUT /api/projects/[id]

Update a project.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Request Body:**
```json
{
  "name": "Updated Name",
  "code": "// updated code",
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "id": "project_123",
  "name": "Updated Name",
  "code": "// updated code",
  "nodes": [...],
  "edges": [...],
  "updatedAt": 1704067200000
}
```

---

### DELETE /api/projects/[id]

Delete a project (soft delete by default).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |
| hard | boolean | No | If true, permanently delete (default: false) |

**Response (soft delete):**
```json
{
  "success": true,
  "isDeleted": true
}
```

**Response (hard delete):**
```json
{
  "success": true,
  "hardDeleted": true
}
```

---

### POST /api/projects/[id]/restore

Restore a soft-deleted project.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "id": "project_123",
  "name": "Restored Project",
  "updatedAt": 1704067200000
}
```

---

## History API

### GET /api/projects/[id]/history

Get project audit history.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "history": [
    {
      "id": "history_1",
      "projectId": "project_123",
      "action": "create",
      "changedBy": "user_1",
      "changedAt": 1704067200000
    }
  ]
}
```

---

## Versions API

### GET /api/projects/[id]/versions

List project versions.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |
| limit | number | No | Number of versions (default: 20) |

**Response:**
```json
{
  "versions": [
    {
      "id": "version_1",
      "projectId": "project_123",
      "version": 1,
      "name": "My Flowchart",
      "code": "// code snapshot",
      "nodes": [...],
      "edges": [...],
      "createdAt": 1704067200000,
      "createdBy": "user_1",
      "description": "Version description"
    }
  ]
}
```

---

### POST /api/projects/[id]/versions

Create a new version snapshot.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Request Body:**
```json
{
  "description": "Before refactoring"
}
```

**Response (201):**
```json
{
  "id": "version_2",
  "projectId": "project_123",
  "version": 2,
  "name": "My Flowchart",
  "code": "// current code",
  "nodes": [...],
  "edges": [...],
  "createdAt": 1704067200000,
  "createdBy": "user_1",
  "description": "Before refactoring"
}
```

---

### GET /api/projects/[id]/versions/[versionId]

Get a specific version.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "id": "version_1",
  "projectId": "project_123",
  "version": 1,
  "name": "My Flowchart",
  "code": "// code snapshot",
  "nodes": [...],
  "edges": [...],
  "createdAt": 1704067200000,
  "createdBy": "user_1"
}
```

---

### POST /api/projects/[id]/versions/[versionId]/restore

Restore project to a specific version.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "id": "project_123",
  "name": "My Flowchart",
  "code": "// restored code",
  "nodes": [...],
  "edges": [...],
  "updatedAt": 1704067200000
}
```

---

### DELETE /api/projects/[id]/versions/[versionId]

Delete a version.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |

**Response:**
```json
{
  "success": true,
  "deleted": true
}
```

---

## Backup API

### GET /api/backup

Export user data.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID |
| format | string | No | "json" or "blob" (default: "json") |
| metadata | boolean | No | If true, returns metadata only |

**Response (metadata):**
```json
{
  "projectCount": 10,
  "lastUpdated": 1704067200000
}
```

**Response (data):**
Returns JSON file as download with Content-Disposition header.

---

### POST /api/backup/import

Import user data from backup.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | Target User ID |
| onConflict | string | No | "rename", "skip", or "overwrite" (default: "rename") |

**Request Body:**
- Content-Type: application/json or application/octet-stream
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

---

## Error Reference

| Error Code | Message | Description |
|------------|---------|-------------|
| 400 | Missing userId | Required parameter not provided |
| 400 | Invalid limit | Invalid pagination limit |
| 400 | Invalid onConflict | Unknown conflict strategy |
| 400 | Missing userId or project payload | POST/PUT body validation |
| 404 | Not found | Project or version not found |
| 422 | Validation error | Input validation failed |
| 500 | Internal server error | Server-side error |

---

## Rate Limiting

Currently, no rate limiting is enforced. Future versions will include:
- Max 10 writes per user per minute
- Max 100 reads per user per minute

---

## Security

All endpoints should be protected by:
1. Firebase Security Rules (firestore.rules)
2. Server-side validation (Zod schemas)
3. Authentication verification (future JWT implementation)

See `firestore.rules` for detailed security constraints.
