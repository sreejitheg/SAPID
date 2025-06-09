import React, { useState } from 'react';
import { Bot, User, ExternalLink, Copy, Edit2, Check, X } from 'lucide-react';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  isMobile?: boolean;
}

export function MessageBubble({ message, onEdit, isMobile = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const isUser = message.type === 'user';
  const isStreaming = message.isStreaming;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const renderFormattedContent = (content: string) => {
    // Split content into lines and process each line
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        elements.push(
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-current mt-1">•</span>
            <span className="flex-1">{line.trim().substring(1).trim()}</span>
          </div>
        );
      }
      // Handle bold text (convert **text** to bold)
      else if (line.includes('**')) {
        const parts = line.split('**');
        const formattedLine = parts.map((part, index) => 
          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
        );
        elements.push(<div key={lineIndex} className="my-1">{formattedLine}</div>);
      }
      // Handle links
      else if (line.includes('http')) {
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        const parts = line.split(linkRegex);
        const formattedLine = parts.map((part, index) => {
          if (linkRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
              >
                {part}
                <ExternalLink className="w-3 h-3" />
              </a>
            );
          }
          return part;
        });
        elements.push(<div key={lineIndex} className="my-1">{formattedLine}</div>);
      }
      // Regular line
      else {
        elements.push(<div key={lineIndex} className="my-1">{line}</div>);
      }
    });

    return elements;
  };

  return (
    <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-lg relative ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md resize-none text-gray-900"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-green-600 hover:text-green-700 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm leading-relaxed">
                {renderFormattedContent(message.content)}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
                )}
              </div>
              
              {message.documents && message.documents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {message.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {doc.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              {!isMobile && (
                <div className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                  <button
                    onClick={handleCopy}
                    className={`p-1 rounded transition-colors ${
                      isUser 
                        ? 'text-blue-200 hover:text-white hover:bg-blue-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Copy message"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                  {isUser && onEdit && (
                    <button
                      onClick={handleEdit}
                      className="p-1 text-blue-200 hover:text-white hover:bg-blue-700 rounded transition-colors"
                      title="Edit message"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}