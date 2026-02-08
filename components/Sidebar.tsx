import React from 'react';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { ChatSession, AppSettings } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  chatHistory: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  translations: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  onNewChat, 
  chatHistory, 
  currentChatId, 
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
  settings,
  translations
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-30 w-[280px] bg-[#f9fafb] dark:bg-[#131314] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header / New Chat */}
        <div className="p-4">
          <button 
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="flex items-center gap-3 px-4 py-3 w-full bg-[#e3e8ef] dark:bg-[#1e1f20] hover:bg-[#dbe0e7] dark:hover:bg-[#2d2e30] rounded-full transition-colors text-sm font-medium shadow-sm group"
          >
            <Plus size={18} className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" />
            <span className="text-gray-900 dark:text-gray-200">{translations.newChat}</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2 uppercase tracking-wider">
            {translations.recent}
          </div>
          
          <div className="space-y-1">
            {chatHistory.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center italic">
                    {translations.noHistory}
                </div>
            ) : (
                chatHistory.sort((a,b) => b.updatedAt - a.updatedAt).map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => {
                            onSelectChat(chat.id);
                            if (window.innerWidth < 1024) toggleSidebar();
                        }}
                        className={`group relative flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-colors ${
                            currentChatId === chat.id 
                            ? 'bg-blue-100 dark:bg-[#1e1f20] text-blue-800 dark:text-blue-300' 
                            : 'hover:bg-gray-200/60 dark:hover:bg-[#1e1f20] text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <MessageSquare size={16} className={`flex-shrink-0 ${currentChatId === chat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500'}`} />
                        <span className="text-sm truncate pr-6">{chat.title || 'New Chat'}</span>
                        
                        {/* Delete Button (visible on hover or active) */}
                        <div 
                            onClick={(e) => onDeleteChat(chat.id, e)}
                            className={`absolute right-2 p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-opacity ${currentChatId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <Trash2 size={14} />
                        </div>
                    </button>
                ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
           <button className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg hover:bg-gray-200/60 dark:hover:bg-[#1e1f20] transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-700">
              {settings.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{settings.userName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Free Plan</span>
            </div>
          </button>
           <button 
             onClick={onOpenSettings}
             className="flex items-center gap-3 px-3 py-2 mt-1 w-full text-left rounded-lg hover:bg-gray-200/60 dark:hover:bg-[#1e1f20] text-gray-600 dark:text-gray-400 transition-colors"
           >
            <Settings size={18} />
            <span className="text-sm">{translations.settings}</span>
          </button>
        </div>
      </div>
    </>
  );
};
