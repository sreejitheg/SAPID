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

const BASE = import.meta.env.VITE_API_BASE || '/api';

export function chat(
  sessionId: string,
  text: string,
  onMessage: (data: unknown) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const es = new EventSource(`${BASE}/chat?session_id=${sessionId}&message=${encodeURIComponent(text)}&user=user`);
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
      if (data.type === 'done') {
        es.close();
        resolve();
      }
    };
    es.onerror = (err) => {
      es.close();
      reject(err);
    };
  });
}

export async function uploadTemp(sessionId: string, f: File): Promise<void> {
  const form = new FormData();
  form.append('file', f);
  const res = await fetch(`${BASE}/upload/temp/${sessionId}`, {
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
  const res = await fetch(`${BASE}/upload/global`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error('Failed to upload file');
  }
}
