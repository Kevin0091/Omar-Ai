export interface Attachment {
  mimeType: string;
  data: string; // Base64 string without prefix
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
  attachment?: Attachment;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
}

export interface AppSettings {
  userName: string;
  isDarkMode: boolean;
  language: 'en' | 'ar' | 'fr';
}
