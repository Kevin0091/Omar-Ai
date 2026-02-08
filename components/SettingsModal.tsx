import React from 'react';
import { X, Moon, Sun, Globe, User } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Profile Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User size={16} />
              Profile Name
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Appearance Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {settings.isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              Appearance
            </label>
            <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => onUpdateSettings({ ...settings, isDarkMode: false })}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!settings.isDarkMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Light
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, isDarkMode: true })}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${settings.isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Language Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Globe size={16} />
              Interface Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
