import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { QuickUpload } from './QuickUpload';
import { DynamicForm } from './DynamicForm';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onQuickUpload: (file: File) => Promise<void>;
  onEditMessage?: (messageId: string, newContent: string) => void;
  isStreaming: boolean;
  isMobile: boolean;
  conversationTitle?: string;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  onQuickUpload, 
  onEditMessage,
  isStreaming, 
  isMobile,
  conversationTitle 
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isStreaming) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleQuickUpload = async (file: File) => {
    try {
      await onQuickUpload(file);
      setShowQuickUpload(false);
    } catch (error) {
      console.error('Quick upload failed:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${isMobile ? '' : 'dark:bg-gray-900'}`}>
      {/* Conversation Header */}
      {conversationTitle && !isMobile && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate">{conversationTitle}</h2>
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMobile ? 'pb-safe' : ''}`}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Welcome to SAPID
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your AI-powered assistant for document analysis and task automation.
              </p>
              <div className="grid gap-2 text-sm text-left">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <strong>Upload documents</strong> to analyze and discuss
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <strong>Ask questions</strong> about your files
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <strong>Generate reports</strong> and summaries
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id}>
                <MessageBubble 
                  message={message} 
                  onEdit={onEditMessage}
                  isMobile={isMobile}
                />
                {message.forms && message.forms.map((form) => (
                  <div key={form.id} className="mt-4">
                    <DynamicForm form={form} />
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area - Fixed at bottom for mobile */}
      <div className={`border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 ${
        isMobile ? 'sticky bottom-0 pb-safe' : ''
      }`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowQuickUpload(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your documents..."
              className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              rows={1}
              disabled={isStreaming}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isStreaming}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Quick Upload Modal */}
      {showQuickUpload && (
        <QuickUpload
          onUpload={handleQuickUpload}
          onClose={() => setShowQuickUpload(false)}
        />
      )}
    </div>
  );
}