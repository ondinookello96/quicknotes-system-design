# QuickNotes REST API Design Document

## Base URL

`https://api.quicknotes.com/v1`

---

## Endpoints Overview

| Method   | Path                | Description                                                       | Success Status   |
| :------- | :------------------ | :---------------------------------------------------------------- | :--------------- |
| `GET`    | `/notes`            | Retrieve a paginated list of all notes for the authenticated user | `200 OK`         |
| `GET`    | `/notes/{id}`       | Retrieve a single note by its unique ID                           | `200 OK`         |
| `POST`   | `/notes`            | Create a new note record                                          | `201 Created`    |
| `PUT`    | `/notes/{id}`       | Fully update an existing note                                     | `200 OK`         |
| `DELETE` | `/notes/{id}`       | Delete a note by ID                                               | `204 No Content` |
| `GET`    | `/notes?tag=urgent` | List notes filtered by a specific tag query parameter             | `200 OK`         |

---

## JSON Payloads

### Creating a Note (`POST /notes`)

**Request Body:**

```json
{
  "title": "Project Meeting Notes",
  "body": "Discuss database indexing and architecture scaling.",
  "tags": ["work", "urgent"]
}
```

Response Body (201 Created):

{
"id": 42,
"user_id": 7,
"title": "Project Meeting Notes",
"body": "Discuss database indexing and architecture scaling.",
"created_at": "2026-10-16T14:30:00Z"
}

Listing Notes (GET /notes)
Response Body (200 OK):
[
{
"id": 42,
"title": "Project Meeting Notes",
"body": "Discuss database indexing and architecture scaling.",
"created_at": "2026-10-16T14:30:00Z"
}
]

Error Handling & Status Codes
400 Bad Request: Malformed JSON or validation failure (e.g., missing title or title exceeding 100 characters).

401 Unauthorized: Missing or invalid authentication token.

403 Forbidden: Authenticated user attempts to access or modify a note belonging to another user.

404 Not Found: The requested note ID or endpoint does not exist.

500 Internal Server Error: Unexpected database or server crash.

Example Error Response (400 Bad Request):
{
"error": {
"status": 400,
"message": "Validation Failed: Title is required and cannot exceed 100 characters."
}
}
