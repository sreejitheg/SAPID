import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppSettings } from '../../types';

interface HeaderProps {
  settings: AppSettings;
}

export function Header({ settings }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">SAPID</h1>
          {settings.demoMode && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
              Demo Mode
            </span>
          )}
          {!settings.backendHealthy && !settings.demoMode && (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
              Backend Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}