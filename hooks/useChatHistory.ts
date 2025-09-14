import { useCallback, useEffect, useState } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUri?: string; // Optional image attachment
}

// Global state for chat history (persists during app session, not saved to disk)
let globalMessages: Message[] = [
  {
    id: '1',
    text: "Hi! I'm your AI cooking assistant. I can help you find recipes, suggest cooking techniques, answer cooking questions, and much more! What would you like to know?",
    isUser: false,
    timestamp: new Date(),
  },
];

// Listeners for state changes
const listeners: Set<() => void> = new Set();

export function useChatHistory() {
  const [messages, setMessages] = useState<Message[]>(globalMessages);

  // Subscribe to global state changes
  const forceUpdate = useCallback(() => {
    setMessages([...globalMessages]);
  }, []);

  // Add listener on mount
  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, [forceUpdate]);

  const addMessage = useCallback((message: Message) => {
    globalMessages = [...globalMessages, message];
    // Notify all subscribers
    listeners.forEach(listener => listener());
  }, []);

  const clearHistory = useCallback(() => {
    globalMessages = [
      {
        id: '1',
        text: "Hi! I'm your AI cooking assistant. I can help you find recipes, suggest cooking techniques, answer cooking questions, and much more! What would you like to know?",
        isUser: false,
        timestamp: new Date(),
      },
    ];
    // Notify all subscribers
    listeners.forEach(listener => listener());
  }, []);

  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  return {
    messages,
    addMessage,
    clearHistory,
    generateId,
  };
}
