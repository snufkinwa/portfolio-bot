"use client";

import { useChat } from "ai/react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Create a context for the chat
export const ChatContext = createContext<
  (ReturnType<typeof useChat> & { resetMessages: () => void }) | null
>(null);

// Create a hook to use the chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
}

// Create a provider component
export function ChatContextProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );

  const chatHelpers = useChat({
    api: "/api/chat",
    id: sessionId,
    body: {
      id: sessionId,
    },
    onError: (error) => {
      console.error("Chat API error:", error);
    },
  });

  // Function to reset messages and generate a new session ID
  const resetMessages = useCallback(() => {
    // Generate a new session ID
    const newSessionId = Math.random().toString(36).substring(2, 15);
    setSessionId(newSessionId);

    // Clear the messages
    chatHelpers.setMessages([]);
    
    // Reset scroll position for any scrollable elements
    setTimeout(() => {
      window.scrollTo(0, 0);
      const scrollableElements = document.querySelectorAll('.overflow-y-auto');
      scrollableElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0;
        }
      });
    }, 0);
  }, [chatHelpers]);

  return (
    <ChatContext.Provider value={{ ...chatHelpers, resetMessages }}>
      {children}
    </ChatContext.Provider>
  );
}
