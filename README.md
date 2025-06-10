# SAPID

## Setup

1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run the API:
   ```bash
   uvicorn backend.main:app --reload --port 8001
   ```

The backend connects to an Ollama server defined by `OLLAMA_URL` (defaults to
`http://localhost:11434`). When starting up, it now checks that the models
specified by `OLLAMA_CHAT_MODEL` and `OLLAMA_EMBED_MODEL` are present. If a
model is missing, it will automatically pull it from the Ollama registry. For
example, setting `OLLAMA_CHAT_MODEL=mistral:latest` will trigger a pull of that
model on first run if it's not already installed.

## Available API Endpoints

- `GET /health` – Application status
- `GET /demo` – Example conversations and documents
- `POST /chat/` – Chat with the assistant (SSE stream)
- `POST /upload/` – Upload a PDF (`type=global|temp`, `session_id` when temp)
- `POST /upload/global` – Upload to global collection
- `POST /upload/temp/{session_id}` – Upload to session collection
- `GET /upload/documents` – List documents (optional `session_id`)
- `GET /upload/documents/{doc_id}` – Retrieve document metadata
- `DELETE /upload/documents/{doc_id}` – Remove a document
- `POST /sessions/` – Create a chat session
- `DELETE /sessions/{session_id}` – Delete a session
- `POST /conversations/` – Create a conversation
- `GET /conversations` – List conversations (`session_id` optional)
- `DELETE /conversations/{conversation_id}` – Delete a conversation
- `GET /conversations/{conversation_id}/messages` – Conversation history
- `POST /forms/` – Submit form data
- `POST /email/` – Send an email via stub service
