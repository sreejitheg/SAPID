import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ChatInterface } from './components/Chat/ChatInterface';
import { MobileLayout } from './components/Mobile/MobileLayout';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createUnifiedService } from './demo/demoService';
import { Message, Document, AppSettings, Conversation, SidebarTab } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<SidebarTab>('conversations');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [settings, setSettings] = useLocalStorage<AppSettings>('sapid-settings', {
    webSearchEnabled: true,
    demoMode: true,
    darkMode: false,
    backendHealthy: false,
    userRole: 'user',
    sidebarCollapsed: false,
  });

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize session and load data
  useEffect(() => {
    const initializeApp = async () => {
      const service = createUnifiedService(settings.demoMode);
      
      try {
        await service.createSession();
        await loadConversations();
        await loadDocuments();
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initializeApp();

    // Cleanup session on unmount
    return () => {
      const service = createUnifiedService(settings.demoMode);
      service.deleteSession();
    };
  }, [settings.demoMode]);

  // Load conversation messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    const service = createUnifiedService(settings.demoMode);
    try {
      const convs = await service.getConversations();
      setConversations(convs);
      
      // Set first conversation as active if none selected
      if (!activeConversationId && convs.length > 0) {
        setActiveConversationId(convs[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    const service = createUnifiedService(settings.demoMode);
    try {
      const msgs = await service.getConversationMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  };

  const loadDocuments = async () => {
    const service = createUnifiedService(settings.demoMode);
    try {
      const docs = await service.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleNewConversation = async () => {
    const service = createUnifiedService(settings.demoMode);
    try {
      const newConv = await service.createConversation('New Conversation');
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setActiveTab('conversations');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleConversationDelete = async (conversationId: string) => {
    const service = createUnifiedService(settings.demoMode);
    try {
      await service.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If deleted conversation was active, select another one
      if (activeConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : undefined);
      }
      
      // Reload documents as temporary ones might have been deleted
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) {
      // Create new conversation if none exists
      await handleNewConversation();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const service = createUnifiedService(settings.demoMode);
      let streamContent = '';
      let forms: any[] = [];
      
      const streamGenerator = service.streamChat(content, activeConversationId, settings.webSearchEnabled);

      for await (const chunk of streamGenerator) {
        if (chunk.type === 'content') {
          streamContent += chunk.content;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id
                ? { ...msg, content: streamContent }
                : msg
            )
          );
        } else if (chunk.type === 'form') {
          forms.push(chunk.form_data);
        } else if (chunk.type === 'document_reference') {
          // Handle document references
        }
      }

      // Mark streaming as complete and add forms if any
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false, forms: forms.length > 0 ? forms : undefined }
            : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id
            ? { 
                ...msg, 
                content: 'Sorry, I encountered an error. Please try again.',
                isStreaming: false 
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { ...msg, content: newContent }
          : msg
      )
    );
  };

  const handleDocumentUpload = async (file: File, type: 'permanent' | 'temporary') => {
    const service = createUnifiedService(settings.demoMode);
    setIsUploading(true);
    try {
      const doc = await service.uploadDocument(file, type);
      // Add conversation ID for temporary documents
      if (type === 'temporary' && activeConversationId) {
        doc.conversationId = activeConversationId;
      }
      setDocuments(prev => [...prev, doc]);
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickUpload = async (file: File) => {
    await handleDocumentUpload(file, 'temporary');
  };

  const handleDocumentDelete = async (docId: string) => {
    const service = createUnifiedService(settings.demoMode);
    try {
      await service.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  };

  const currentConversation = conversations.find(c => c.id === activeConversationId);

  if (isMobile) {
    return (
      <MobileLayout
        messages={messages}
        documents={documents}
        conversations={conversations}
        settings={settings}
        activeTab={activeTab}
        activeConversationId={activeConversationId}
        onSendMessage={handleSendMessage}
        onQuickUpload={handleQuickUpload}
        onDocumentDelete={handleDocumentDelete}
        onSettingsChange={setSettings}
        onTabChange={setActiveTab}
        onNewConversation={handleNewConversation}
        onConversationSelect={handleConversationSelect}
        onConversationDelete={handleConversationDelete}
        onDocumentUpload={handleDocumentUpload}
        onEditMessage={handleEditMessage}
        isStreaming={isStreaming}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className={`flex flex-col h-screen ${settings.darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      <Header
        settings={settings}
        isMobile={isMobile}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNewConversation={handleNewConversation}
          conversations={conversations}
          documents={documents}
          settings={settings}
          onConversationSelect={handleConversationSelect}
          onConversationDelete={handleConversationDelete}
          onDocumentUpload={handleDocumentUpload}
          onDocumentDelete={handleDocumentDelete}
          onSettingsChange={setSettings}
          isUploading={isUploading}
          activeConversationId={activeConversationId}
        />
        
        <main className="flex-1 flex flex-col">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onQuickUpload={handleQuickUpload}
            onEditMessage={handleEditMessage}
            isStreaming={isStreaming}
            isMobile={isMobile}
            conversationTitle={currentConversation?.title}
          />
        </main>
      </div>
    </div>
  );
}

export default App;