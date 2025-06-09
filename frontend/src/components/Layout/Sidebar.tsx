import React from 'react';
import { MessageSquare, FileText, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarTab, AppSettings } from '../../types';
import { ConversationsTab } from './ConversationsTab';
import { DocumentsTab } from './DocumentsTab';
import { SettingsTab } from './SettingsTab';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onNewConversation: () => void;
  conversations: any[];
  documents: any[];
  settings: AppSettings;
  onConversationSelect: (id: string) => void;
  onConversationDelete: (id: string) => void;
  onDocumentUpload: (file: File, type: 'permanent' | 'temporary') => Promise<void>;
  onDocumentDelete: (id: string) => void;
  onSettingsChange: (settings: any) => void;
  isUploading: boolean;
  activeConversationId?: string;
  isMobile?: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onNewConversation,
  conversations,
  documents,
  settings,
  onConversationSelect,
  onConversationDelete,
  onDocumentUpload,
  onDocumentDelete,
  onSettingsChange,
  isUploading,
  activeConversationId,
  isMobile = false,
}: SidebarProps) {
  const tabs = [
    { id: 'conversations' as SidebarTab, icon: MessageSquare, label: 'Conversations' },
    { id: 'documents' as SidebarTab, icon: FileText, label: 'Documents' },
    { id: 'settings' as SidebarTab, icon: Settings, label: 'Settings' },
  ];

  const toggleSidebar = () => {
    onSettingsChange({ ...settings, sidebarCollapsed: !settings.sidebarCollapsed });
  };

  const sidebarWidth = settings.sidebarCollapsed ? 'w-16' : 'w-80';

  if (isMobile) {
    return (
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'conversations' && (
            <ConversationsTab
              conversations={conversations}
              onConversationSelect={onConversationSelect}
              onConversationDelete={onConversationDelete}
              onNewConversation={onNewConversation}
              activeConversationId={activeConversationId}
            />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab
              documents={documents.filter(doc => 
                doc.type === 'temporary' && doc.conversationId === activeConversationId
              )}
              onDocumentUpload={onDocumentUpload}
              onDocumentDelete={onDocumentDelete}
              isUploading={isUploading}
              userRole={settings.userRole}
              isMobile={true}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          )}
        </div>

        {/* Tab Navigation - Bottom */}
        <div className="border-t border-gray-200 bg-gray-50">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${sidebarWidth} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out relative`}>
      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {settings.sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {!settings.sidebarCollapsed && (
          <>
            {activeTab === 'conversations' && (
              <ConversationsTab
                conversations={conversations}
                onConversationSelect={onConversationSelect}
                onConversationDelete={onConversationDelete}
                onNewConversation={onNewConversation}
                activeConversationId={activeConversationId}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab
                documents={documents}
                onDocumentUpload={onDocumentUpload}
                onDocumentDelete={onDocumentDelete}
                isUploading={isUploading}
                userRole={settings.userRole}
                isMobile={false}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            )}
          </>
        )}
      </div>

      {/* Tab Navigation - Bottom */}
      <div className="border-t border-gray-200 bg-gray-50">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {!settings.sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}