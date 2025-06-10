import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, TestTube, Activity, WifiOff, RefreshCw, Shield, User } from 'lucide-react';
import { AppSettings } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface SettingsTabProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkBackendHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const healthy = response.ok;
      onSettingsChange({ ...settings, backendHealthy: healthy });
    } catch (error) {
      console.error('Backend health check failed:', error);
      onSettingsChange({ ...settings, backendHealthy: false });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (!settings.demoMode) {
      checkBackendHealth();
    }
  }, [settings.demoMode]);

  const toggleSetting = (key: keyof AppSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const handleUserRoleChange = () => {
    onSettingsChange({ 
      ...settings, 
      userRole: settings.userRole === 'admin' ? 'user' : 'admin' 
    });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Settings</h2>
      </div>

      {/* User Role */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">User Access</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.userRole === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <div>
                <span className="text-sm text-gray-600">Administrator Mode</span>
                <p className="text-xs text-gray-500">Access to permanent document management</p>
              </div>
            </div>
            <button
              onClick={handleUserRoleChange}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.userRole === 'admin' ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.userRole === 'admin' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Appearance</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-sm text-gray-600">Dark Mode</span>
            </div>
            <button
              onClick={() => toggleSetting('darkMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">AI Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              <div>
                <span className="text-sm text-gray-600">Web Search</span>
                <p className="text-xs text-gray-500">Allow AI to search the internet</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('webSearchEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.webSearchEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.webSearchEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Development */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Development</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-4 h-4" />
              <div>
                <span className="text-sm text-gray-600">Demo Mode</span>
                <p className="text-xs text-gray-500">Use mock data for testing</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('demoMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.demoMode ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.demoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Backend Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Backend Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.backendHealthy ? (
                <Activity className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <div>
                <span className="text-sm text-gray-600">Connection Status</span>
                <p className="text-xs text-gray-500">
                  {settings.demoMode 
                    ? 'Demo mode active' 
                    : settings.backendHealthy 
                      ? 'Connected'
                      : 'Backend unavailable'
                  }
                </p>
              </div>
            </div>
            {!settings.demoMode && (
              <button
                onClick={checkBackendHealth}
                disabled={isCheckingHealth}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">System Information</h3>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Version:</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span>{settings.demoMode ? 'Demo' : 'Production'}</span>
          </div>
          <div className="flex justify-between">
            <span>User Role:</span>
            <span className="capitalize">{settings.userRole}</span>
          </div>
          <div className="flex justify-between">
            <span>API Endpoint:</span>
            <span>{settings.demoMode ? 'Mock Service' : API_BASE_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
}