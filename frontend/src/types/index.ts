export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  documents?: DocumentReference[];
  forms?: DynamicForm[];
  isEditing?: boolean;
  originalContent?: string;
}

export interface DocumentReference {
  id: string;
  name: string;
  url: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'permanent' | 'temporary';
  size: number;
  uploadedAt: Date;
  url?: string;
  conversationId?: string; // For temporary documents
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage?: string;
}

export interface Session {
  id: string;
  createdAt: Date;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  value?: any;
}

export interface DynamicForm {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  data?: Record<string, any>;
}

export interface AppSettings {
  webSearchEnabled: boolean;
  demoMode: boolean;
  darkMode: boolean;
  backendHealthy: boolean;
  userRole: 'admin' | 'user';
  sidebarCollapsed: boolean;
}

export type SidebarTab = 'conversations' | 'documents' | 'settings';