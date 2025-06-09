import { Document, Message, DynamicForm, Session } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private sessionId: string | null = null;

  async createSession(): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    const session = await response.json();
    this.sessionId = session.id;
    return session;
  }

  async deleteSession(): Promise<void> {
    if (!this.sessionId) return;
    
    await fetch(`${API_BASE_URL}/sessions/${this.sessionId}`, {
      method: 'DELETE',
    });
    
    this.sessionId = null;
  }

  async uploadDocument(file: File, type: 'permanent' | 'temporary'): Promise<Document> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('session_id', this.sessionId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return await response.json();
  }

  async getDocuments(): Promise<Document[]> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/documents?session_id=${this.sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return await response.json();
  }

  async getDocument(docId: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    return await response.json();
  }

  async deleteDocument(docId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  }

  async *streamChat(message: string, webSearchEnabled: boolean): AsyncGenerator<string, void, unknown> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: this.sessionId,
        web_search: webSearchEnabled,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async submitForm(formId: string, data: Record<string, any>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form_id: formId,
        data,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }
  }

  async sendEmail(data: Record<string, any>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  }

  async getDemoData(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/demo`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch demo data');
    }

    return await response.json();
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

export const apiService = new ApiService();