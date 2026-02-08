import React from 'react';
import { Sparkles, Code, PenTool, Lightbulb } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
  userName: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick, userName }) => {
  const suggestions = [
    {
      icon: <Code size={20} className="text-purple-500" />,
      text: "Write a React component",
      prompt: "Write a functional React component for a responsive navigation bar using Tailwind CSS."
    },
    {
      icon: <PenTool size={20} className="text-blue-500" />,
      text: "Draft an email",
      prompt: "Draft a professional email to a client explaining a project delay due to unforeseen technical challenges."
    },
    {
      icon: <Lightbulb size={20} className="text-yellow-500" />,
      text: "Brainstorm ideas",
      prompt: "Brainstorm 5 unique marketing ideas for a new eco-friendly coffee brand."
    },
    {
      icon: <Sparkles size={20} className="text-red-500" />,
      text: "Who created you?",
      prompt: "Who created you?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
      <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
         <Sparkles size={48} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <h1 className="text-4xl font-semibold text-gray-800 dark:text-white mb-2">Hello, {userName}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-12 max-w-lg">
        How can I help you today? I can assist with coding, writing, analysis, and more.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="flex items-center gap-4 p-4 text-left bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2d2e30] hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md group"
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
              {suggestion.icon}
            </div>
            <span className="text-gray-700 dark:text-gray-200 font-medium">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
