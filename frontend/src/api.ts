export interface Source {
  doc_id: string;
  page: number;
  chunk_id: number;
  text: string;
}

export interface ChatResponse {
  answer: string;
  intent: string;
  sources: Source[];
}

const baseURL = import.meta.env.VITE_API_BASE || '/api';

export async function chat(sessionId: string, text: string): Promise<ChatResponse> {
  const res = await fetch(`${baseURL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, user: 'user', message: text }),
  });
  if (!res.ok) {
    throw new Error('Failed to send chat message');
  }
  return res.json();
}

export async function uploadTemp(sessionId: string, f: File): Promise<void> {
  const form = new FormData();
  form.append('file', f);
  const res = await fetch(`${baseURL}/upload/temp/${sessionId}`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error('Failed to upload file');
  }
}

export async function uploadGlobal(f: File): Promise<void> {
  const form = new FormData();
  form.append('file', f);
  const res = await fetch(`${baseURL}/upload/global`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error('Failed to upload file');
  }
}
