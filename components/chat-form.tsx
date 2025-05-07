"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, ArrowUpIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/components/ui/sidebar";
import { useChatContext } from "@/components/chat-context-provider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Message } from "ai/react";
import { useRouter } from "next/navigation";

interface ChatFormProps extends React.ComponentProps<"form"> {
  chatId?: string;
  initialMessages?: Message[];
  isLanding?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  "Tell me about Janay's background and skills",
  "What projects has Janay worked on?",
  "What experience does Janay have with AI and machine learning?",
  "Which organizations has Janay been part of?",
];

export function ChatForm({
  chatId,
  initialMessages,
  isLanding = false,
  className,
  ...props
}: ChatFormProps) {
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const router = useRouter();

  // Use the shared chat context
  const { messages, input, setInput, append, isLoading, resetMessages } =
    useChatContext();

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping, isLoading]);

  // Reset scroll when chat ID changes or on initial load
  useEffect(() => {
    window.scrollTo(0, 0);

    const scrollableContainer = document.querySelector(".overflow-y-auto");
    if (scrollableContainer instanceof HTMLElement) {
      scrollableContainer.scrollTop = 0;
    }
  }, [chatId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // If we're on the landing page, create a new chat first
    if (isLanding) {
      try {
        resetMessages();

        const response = await fetch("/api/chat/create", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        const { chatId: newChatId } = await response.json();

        router.push(`/chat/${newChatId}`);

        const userMessage = input;
        setInput("");

        setTimeout(() => {
          setShowTyping(true);
          void append({ content: userMessage, role: "user" });
        }, 100);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    } else {
      setShowTyping(true);
      void append({ content: input, role: "user" });
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLanding) {
      try {
        resetMessages();

        const response = await fetch("/api/chat/create", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        const { chatId: newChatId } = await response.json();

        router.push(`/chat/${newChatId}`);

        const userSuggestion = suggestion;

        setTimeout(() => {
          setShowTyping(true);
          void append({ content: userSuggestion, role: "user" });
        }, 100);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    } else {
      setShowTyping(true);
      void append({ content: suggestion, role: "user" });
    }
  };

  const SuggestionBox = ({ suggestion }: { suggestion: string }) => (
    <button
      type="button"
      className="text-left px-4 py-3 border border-secondary/70 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer flex items-center gap-2 group shadow-sm"
      onClick={() => handleSuggestionClick(suggestion)}
    >
      <span className="flex-1 text-sm">{suggestion}</span>
      <ArrowRightIcon className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  const suggestions = (
    <div className="flex flex-col gap-4 w-full text-center">
      <h2 className="text-lg font-medium">Learn more about Janay</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {DEFAULT_SUGGESTIONS.map((suggestion) => (
          <SuggestionBox key={suggestion} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );

  const header = (
    <header className="flex flex-col gap-2 text-center mb-8">
      <h1 className="text-3xl font-semibold leading-none tracking-tight">
        Hiya! You've found Janay's digital doppelgänger.
      </h1>
      <p className="text-muted-foreground text-base">
        Ask me anything about her skills, projects, or journey into AI and
        software engineering.
      </p>
    </header>
  );

  const messageList = (
    <div className="my-4 flex flex-col gap-4">
      {messages.map((message, index) => {
        const isLastAssistantMessage =
          message.role === "assistant" && index === messages.length - 1;

        return (
          <div
            key={index}
            data-role={message.role}
            className="max-w-[85%] sm:max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-accent/50 dark:data-[role=assistant]:bg-accent/50 data-[role=user]:bg-primary data-[role=user]:text-primary-foreground"
          >
            {message.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
                {isLastAssistantMessage && isLoading && (
                  <span className="animate-pulse">▋</span>
                )}
              </div>
            ) : (
              message.content
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );

  if (messages.length) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center border-none overflow-hidden",
          className
        )}
      >
        <div className="w-full max-w-3xl flex-1 overflow-y-auto py-4 px-4 mb-[80px]">
          {messageList}
        </div>
        <div className="w-full max-w-3xl px-4 pb-6 fixed bottom-0 bg-background z-10 border-t border-border pt-3">
          <form
            onSubmit={handleSubmit}
            {...props}
            className="border-input bg-card/80 focus-within:ring-ring/10 relative flex items-center rounded-[16px] border px-3 py-1.5 pr-12 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
          >
            <AutoResizeTextarea
              onKeyDown={handleKeyDown}
              onChange={(v) => setInput(v)}
              value={input}
              placeholder="Ask about Janay's experience..."
              className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none max-h-32"
              disabled={isLoading}
            />
            {isMobile ? (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="absolute bottom-1 right-1 size-8 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpIcon size={18} />
                )}
                <span className="sr-only">Send</span>
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={isLoading || !input.trim()}
                      className="absolute bottom-1 right-1 size-8 rounded-full"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowUpIcon size={18} />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>Send</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </form>
        </div>
      </div>
    );
  }

  // For empty chat, render welcome layout with suggestions
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-between border-none overflow-hidden",
        className
      )}
    >
      {/* Top content section */}
      <div className="flex-1 flex flex-col items-center justify-end pt-12 pb-6">
        <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center mb-6 overflow-hidden">
          <img
            src="/avatar.jpeg"
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="w-full max-w-2xl px-4">{header}</div>
      </div>

      {/* Middle section with input - exactly centered */}
      <div className="flex justify-center items-center py-5 px-4 w-full">
        <form
          onSubmit={handleSubmit}
          {...props}
          className="border-input bg-card/80 focus-within:ring-ring/10 relative max-w-2xl w-full flex items-center rounded-[16px] border px-4 py-3 pr-12 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder="Ask me anything about Janay..."
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none max-h-32"
            disabled={isLoading}
          />
          {isMobile ? (
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="absolute bottom-1 right-1 size-8 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpIcon size={18} />
              )}
              <span className="sr-only">Send</span>
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="absolute bottom-1 right-1 size-8 rounded-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpIcon size={18} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12}>Send</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </form>
      </div>

      {/* Bottom section with suggestions */}
      <div className="flex-1 flex flex-col items-center justify-start pt-6 pb-12">
        <div className="w-full max-w-2xl px-4">{suggestions}</div>
      </div>
    </div>
  );
}
