import { Document, Message, Conversation, DynamicForm } from '../types';
import { demoConversations, demoDocuments, demoMessages, demoPurchaseForm } from './demoData';
import { apiService } from '../api/apiService';

class DemoService {
  private conversations: Conversation[] = [...demoConversations];
  private documents: Document[] = [...demoDocuments];
  private messages: Record<string, Message[]> = { ...demoMessages };

  async checkHealth(): Promise<boolean> {
    return true;
  }

  async createSession(): Promise<any> {
    return {
      id: 'demo-session-' + Date.now(),
      created_at: new Date().toISOString(),
    };
  }

  async deleteSession(): Promise<void> {
    // Demo cleanup
  }

  async createConversation(title: string): Promise<Conversation> {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title,
      createdAt: new Date(),
      messageCount: 0,
      lastMessage: '',
    };
    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];
    return newConv;
  }

  async getConversations(): Promise<Conversation[]> {
    return [...this.conversations];
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations = this.conversations.filter(c => c.id !== conversationId);
    delete this.messages[conversationId];
    
    // Remove temporary documents associated with this conversation
    this.documents = this.documents.filter(doc => 
      doc.type === 'permanent' || !this.isDocumentAssociatedWithConversation(doc.id, conversationId)
    );
  }

  private isDocumentAssociatedWithConversation(docId: string, conversationId: string): boolean {
    // In a real implementation, this would check document-conversation associations
    // For demo, we'll assume temporary docs are associated with recent conversations
    return true;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messages[conversationId] || [];
  }

  async uploadDocument(file: File, type: 'permanent' | 'temporary'): Promise<Document> {
    const mockDoc: Document = {
      id: 'doc-' + Date.now(),
      name: file.name,
      type,
      size: file.size,
      uploadedAt: new Date(),
      url: type === 'permanent' ? `/demo/${file.name}` : undefined,
    };
    this.documents.push(mockDoc);
    return mockDoc;
  }

  async getDocuments(): Promise<Document[]> {
    return [...this.documents];
  }

  async getDocument(docId: string): Promise<Document> {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) throw new Error('Document not found');
    return doc;
  }

  async deleteDocument(docId: string): Promise<void> {
    this.documents = this.documents.filter(doc => doc.id !== docId);
  }

  async *streamChat(message: string, conversationId: string, webSearchEnabled: boolean): AsyncGenerator<any, void, unknown> {
    // Simulate different types of responses based on message content
    if (message.toLowerCase().includes('form') || message.toLowerCase().includes('purchase')) {
      yield { type: 'content', content: 'I\'ll help you create a purchase request form. ' };
      await this.delay(300);
      yield { type: 'content', content: 'Let me prepare a comprehensive form for office equipment procurement.\n\n' };
      await this.delay(400);
      yield { type: 'form', form_data: demoPurchaseForm };
      await this.delay(200);
      yield { type: 'content', content: '\nPlease fill out the form above with your equipment details.' };
    } else if (message.toLowerCase().includes('pdf') || message.toLowerCase().includes('document')) {
      yield { type: 'content', content: 'I\'ll analyze the document for you. ' };
      await this.delay(300);
      yield { type: 'content', content: 'Let me review the PDF content...\n\n' };
      await this.delay(500);
      yield { type: 'document_reference', document_id: 'doc1' };
      await this.delay(300);
      yield { type: 'content', content: 'Based on the document analysis, here are the key findings:\n\n• Important insight one\n• Critical observation two\n• Recommended action three' };
    } else {
      // Default streaming response
      const responses = [
        "I'll help you with that. ",
        "Let me analyze the information provided. ",
        "Based on the context, ",
        "here are my findings:\n\n",
        "• Key insight number one\n",
        "• Important observation two\n", 
        "• Critical finding three\n\n",
        "Would you like me to elaborate on any of these points?"
      ];

      for (const chunk of responses) {
        yield { type: 'content', content: chunk };
        await this.delay(150 + Math.random() * 200);
      }
    }

    yield { type: 'done' };
  }

  async submitForm(formId: string, data: Record<string, any>): Promise<void> {
    console.log('Demo form submission:', { formId, data });
    // Simulate form processing
    await this.delay(1000);
  }

  async sendEmail(data: Record<string, any>): Promise<void> {
    console.log('Demo email send:', data);
    await this.delay(500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const demoService = new DemoService();

// Create a unified service that switches between demo and real API
export const createUnifiedService = (demoMode: boolean) => {
  return demoMode ? demoService : apiService;
};