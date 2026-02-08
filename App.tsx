import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, Send, StopCircle, Paperclip, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { Message, ChatSession, AppSettings, Attachment } from './types';
import { geminiService } from './services/geminiService';

// Default Settings
const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Guest User',
  isDarkMode: false,
  language: 'en'
};

// Translations Dictionary
const TRANSLATIONS = {
  en: {
    newChat: 'New chat',
    recent: 'Recent',
    settings: 'Settings',
    placeholder: 'Message Omar Kh...',
    disclaimer: 'Omar Kh may display inaccurate info, including about people, so double-check its responses.',
    noHistory: 'No chat history yet.'
  },
  fr: {
    newChat: 'Nouvelle discussion',
    recent: 'Récent',
    settings: 'Paramètres',
    placeholder: 'Envoyez un message à Omar Kh...',
    disclaimer: 'Omar Kh peut afficher des informations inexactes, veuillez vérifier ses réponses.',
    noHistory: 'Aucun historique.'
  },
  ar: {
    newChat: 'محادثة جديدة',
    recent: 'الأخيرة',
    settings: 'الإعدادات',
    placeholder: 'راسل عمر خ...',
    disclaimer: 'قد يعرض عمر خ معلومات غير دقيقة، لذا تحقق من إجاباته.',
    noHistory: 'لا يوجد سجل للمحادثات.'
  }
};

const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  const [inputText, setInputText] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // New state to track initialization
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization & Persistence ---

  // Load data from LocalStorage on Mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('omarkh_settings');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }

    const storedChats = localStorage.getItem('omarkh_chats');
    if (storedChats) {
      try {
        const parsedHistory = JSON.parse(storedChats);
        setChatHistory(parsedHistory);
      } catch (e) {
        console.error("Error parsing chat history", e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save Settings when changed
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('omarkh_settings', JSON.stringify(settings));
    
    // Apply Dark Mode
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply Language Direction
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings, isLoaded]);

  // Save Chat History when changed
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('omarkh_chats', JSON.stringify(chatHistory));
  }, [chatHistory, isLoaded]);

  // Update current chat in history whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0 && isLoaded) {
      setChatHistory(prev => {
        const index = prev.findIndex(c => c.id === currentChatId);
        
        // If chat doesn't exist in history yet (rare edge case if manually deleted), add it
        if (index === -1) {
             // Optional: Handle restoration or ignore
             return prev;
        }

        const updatedChat = { 
          ...prev[index], 
          messages, 
          updatedAt: Date.now(),
          // Update title if it's "New Chat" and we have a user message
          title: prev[index].title === 'New Chat' && messages[0].role === 'user' 
            ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '') 
            : prev[index].title
        };
        
        const newHistory = [...prev];
        newHistory[index] = updatedChat;
        return newHistory;
      });
    }
  }, [messages, currentChatId, isLoaded]);

  // --- Helper Functions ---

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64Data = await convertFileToBase64(file);
        setPendingAttachment({
          mimeType: file.type,
          data: base64Data
        });
      } catch (error) {
        console.error("Error reading file", error);
      }
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = () => {
    setPendingAttachment(null);
  };

  // --- Chat Logic ---

  const startNewChat = () => {
    // Just reset the UI state. We don't create a history entry until a message is sent
    // to avoid cluttering history with empty chats.
    setCurrentChatId(null);
    setMessages([]);
    setInputText('');
    setPendingAttachment(null);
    setIsGenerating(false);
    geminiService.startChat([]); 
    setIsSidebarOpen(false);
  };

  const selectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setPendingAttachment(null);
      setIsGenerating(false);
      geminiService.startChat(chat.messages);
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update history - localStorage effect will catch this change
    const newHistory = chatHistory.filter(c => c.id !== chatId);
    setChatHistory(newHistory);

    if (currentChatId === chatId) {
      startNewChat();
    }
  };

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, pendingAttachment]);

  // Auto-resize textarea
  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if ((!text.trim() && !pendingAttachment) || isGenerating) return;

    // Ensure we have a current chat ID 
    let activeChatId = currentChatId;
    if (!activeChatId) {
      const newChatId = Date.now().toString();
      // Initialize new chat in history immediately so user sees it in sidebar
      const newChat: ChatSession = { id: newChatId, title: 'New Chat', messages: [], updatedAt: Date.now() };
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      activeChatId = newChatId;
    }

    const currentAttachment = pendingAttachment; // Capture current state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setPendingAttachment(null); // Clear attachment immediately
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    setIsGenerating(true);

    // Add placeholder bot message
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      role: 'model',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, botMessage]);

    try {
      // Pass attachment to service if exists
      const stream = geminiService.sendMessageStream(text, currentAttachment || undefined);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to generate response", error);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, currentChatId, pendingAttachment]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  // Don't render until loaded to prevent flash of wrong theme/content
  if (!isLoaded) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onNewChat={startNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        translations={t}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Top Bar (Mobile) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-700 dark:text-gray-200">Omar Kh</span>
          <div className="w-8" /> 
        </header>

         {/* Top Bar (Desktop) */}
         <header className="hidden lg:flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
           <div className="flex items-center gap-2 text-lg font-medium text-gray-700 dark:text-gray-200 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="opacity-50">Omar Kh</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded">1.0</span>
           </div>
         </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth pb-32 pt-14 lg:pt-16">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSendMessage} userName={settings.userName} />
          ) : (
            <div className="flex flex-col">
              {messages.map((msg, index) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isLast={index === messages.length - 1} 
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 px-4 pb-6 pt-2 transition-colors duration-200">
          <div className="max-w-3xl mx-auto">
            {/* Attachment Preview */}
            {pendingAttachment && (
              <div className="mb-2 relative inline-block">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm w-32 h-32 group">
                   <img 
                      src={`data:${pendingAttachment.mimeType};base64,${pendingAttachment.data}`} 
                      className="w-full h-full object-cover" 
                      alt="Preview" 
                   />
                   <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-all">
                     <button 
                       onClick={removeAttachment}
                       className="p-1 bg-gray-900/80 text-white rounded-full hover:bg-black"
                     >
                       <X size={16} />
                     </button>
                   </div>
                </div>
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-[#f0f4f9] dark:bg-[#1e1f20] rounded-3xl p-3 shadow-inner border border-transparent focus-within:border-gray-300 dark:focus-within:border-gray-600 focus-within:bg-white dark:focus-within:bg-[#2d2e30] focus-within:shadow-md transition-all duration-200">
              
              {/* File Upload Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 mb-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
                className="hidden"
              />

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
                className="flex-1 max-h-[200px] min-h-[24px] bg-transparent border-none focus:ring-0 resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 py-2 px-2"
                style={{ overflowY: textareaRef.current && textareaRef.current.scrollHeight > 200 ? 'auto' : 'hidden' }}
              />

              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={(!inputText.trim() && !pendingAttachment) || isGenerating}
                className={`p-2 rounded-full mb-1 transition-all duration-200 ${
                  (inputText.trim() || pendingAttachment) && !isGenerating
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80' 
                    : 'bg-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? <StopCircle size={20} /> : <Send size={20} />}
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-xs text-gray-400 dark:text-gray-500">{t.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;