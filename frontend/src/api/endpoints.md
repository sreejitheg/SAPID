# SAPID Backend API Endpoints

This document defines the complete API specification for SAPID backend integration.

## Base URL
```
http://localhost:8000
```

## Authentication
All requests should include session management via session_id parameter or header.

---

## Session Management

### Create Session
**POST** `/sessions`

Creates a new user session.

**Response:**
```json
{
  "id": "session_uuid",
  "created_at": "2024-01-20T10:00:00Z"
}
```

### Delete Session
**DELETE** `/sessions/{session_id}`

Cleans up session and associated temporary documents.

**Response:** `204 No Content`

---

## Document Management

### Upload Document
**POST** `/upload`

**Form Data:**
- `file`: File to upload
- `type`: "permanent" | "temporary"
- `session_id`: Current session ID

**Response:**
```json
{
  "id": "doc_uuid",
  "name": "filename.pdf",
  "type": "permanent",
  "size": 1024000,
  "uploaded_at": "2024-01-20T10:00:00Z",
  "url": "/documents/doc_uuid/view"
}
```

### Get Documents
**GET** `/documents?session_id={session_id}`

Returns all documents for the session.

**Response:**
```json
[
  {
    "id": "doc_uuid",
    "name": "filename.pdf",
    "type": "permanent",
    "size": 1024000,
    "uploaded_at": "2024-01-20T10:00:00Z",
    "url": "/documents/doc_uuid/view"
  }
]
```

### Get Document
**GET** `/documents/{doc_id}`

Returns document metadata and content URL.

### Delete Document
**DELETE** `/documents/{doc_id}`

Deletes the specified document.

**Response:** `204 No Content`

---

## Chat & Conversations

### Create Conversation
**POST** `/conversations`

**Body:**
```json
{
  "session_id": "session_uuid",
  "title": "New Conversation"
}
```

**Response:**
```json
{
  "id": "conv_uuid",
  "title": "New Conversation",
  "created_at": "2024-01-20T10:00:00Z",
  "message_count": 0
}
```

### Get Conversations
**GET** `/conversations?session_id={session_id}`

Returns all conversations for the session.

### Delete Conversation
**DELETE** `/conversations/{conversation_id}`

Deletes conversation and associated temporary documents.

### Send Chat Message
**POST** `/chat`

**Body:**
```json
{
  "message": "User message content",
  "conversation_id": "conv_uuid",
  "session_id": "session_uuid",
  "web_search": true
}
```

**Response:** Server-Sent Events (SSE) stream

**SSE Format:**
```
data: {"type": "content", "content": "Partial response text"}
data: {"type": "content", "content": " more text"}
data: {"type": "document_reference", "document_id": "doc_uuid"}
data: {"type": "form", "form_data": {...}}
data: {"type": "done"}
```

### Get Conversation Messages
**GET** `/conversations/{conversation_id}/messages`

Returns all messages in a conversation.

---

## Dynamic Forms

### Submit Form
**POST** `/forms`

**Body:**
```json
{
  "form_id": "form_uuid",
  "data": {
    "field_name": "field_value"
  },
  "session_id": "session_uuid"
}
```

**Response:** `200 OK`

---

## Email Actions

### Send Email
**POST** `/email`

**Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email content",
  "session_id": "session_uuid"
}
```

**Response:** `200 OK`

---

## System Status

### Health Check
**GET** `/health`

Returns backend system status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "version": "1.0.0"
}
```

### Demo Data
**GET** `/demo`

Returns mock data for demo mode testing.

---

## WebSocket (Future)

### Audio Stream
**WebSocket** `/ws/audio`

Reserved for future voice functionality.

---

## Error Responses

All endpoints return appropriate HTTP status codes with error details:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

Common status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error