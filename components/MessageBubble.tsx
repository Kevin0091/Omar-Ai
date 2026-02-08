import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`group w-full border-b border-black/5 dark:border-white/5 ${isUser ? 'bg-transparent' : 'bg-[#f9fafb] dark:bg-[#131314]'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8 flex gap-4 md:gap-6">
        
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-sm'}`}>
            {isUser ? (
              <User size={18} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <Bot size={18} className="text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          <div className="font-semibold text-sm mb-1 opacity-90 text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'Omar Kh'}
          </div>
          
          {/* Attachment (Image) */}
          {message.attachment && (
            <div className="mb-4 mt-1">
              <img 
                src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`} 
                alt="Uploaded attachment" 
                className="max-w-xs sm:max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              />
            </div>
          )}

          <div className="markdown-body leading-7 text-[16px] text-gray-800 dark:text-gray-200">
            {message.content ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content}
                </ReactMarkdown>
            ) : (
                <span className="text-gray-400 italic">...</span>
            )}
          </div>

          {/* Typing Indicator for empty streaming message */}
          {message.isStreaming && !message.content && (
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
          )}

          {/* Footer Actions (Bot only) */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-2 mt-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:text-gray-600 dark:hover:text-gray-300 rounded" title="Copy">
                <Copy size={16} />
              </button>
              <button className="p-1 hover:text-gray-600 dark:hover:text-gray-300 rounded" title="Regenerate">
                <RotateCcw size={16} />
              </button>
              <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1"></div>
              <button className="p-1 hover:text-gray-600 dark:hover:text-gray-300 rounded" title="Good response">
                <ThumbsUp size={16} />
              </button>
              <button className="p-1 hover:text-gray-600 dark:hover:text-gray-300 rounded" title="Bad response">
                <ThumbsDown size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};