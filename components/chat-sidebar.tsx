"use client";

import {
  BookOpen,
  Code,
  PanelLeftClose,
  GraduationCap,
  Briefcase,
  Award,
  UserCircle,
  Brain,
  Blocks,
  Cpu,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/components/chat-context-provider";
import { useState } from "react";

const TOPICS = [
  {
    id: "about",
    label: "About Me",
    icon: UserCircle,
    prompt: "Who is Janay Harris, and what sets her apart in tech?",
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    prompt: "Where did Janay study, and what did she focus on academically?",
  },
  {
    id: "experience",
    label: "Work Experience",
    icon: Briefcase,
    prompt: "Can you walk me through Janay’s professional journey so far?",
  },
  {
    id: "projects",
    label: "Projects",
    icon: Code,
    prompt: "What standout projects has Janay built, and why do they matter?",
  },
  {
    id: "skills",
    label: "Technical Skills",
    icon: BookOpen,
    prompt:
      "What technologies, languages, and tools does Janay work with confidently?",
  },
  {
    id: "ai-ml",
    label: "AI/ML Experience",
    icon: Brain,
    prompt: "How has Janay applied AI and machine learning in her projects?",
  },
  {
    id: "blockchain",
    label: "Blockchain",
    icon: Blocks,
    prompt:
      "Tell me about Janay’s experience with blockchain and smart contracts.",
  },
  {
    id: "systems",
    label: "Systems Programming",
    icon: Cpu,
    prompt: "Has Janay done any systems-level programming in C, C++, or Rust?",
  },
  {
    id: "awards",
    label: "Certifications & Awards",
    icon: Award,
    prompt:
      "What certifications and scholarships has Janay earned, and what do they represent?",
  },
];

export function ChatSidebar() {
  const { toggleSidebar, isMobile, setOpenMobile, setOpen } = useSidebar();
  const router = useRouter();

  const { append, resetMessages } = useChatContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTopicSelect = async (prompt: string) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const url = window.location.pathname;
      const isLanding = url === "/" || url === "";

      if (isLanding) {
        resetMessages();

        const response = await fetch("/api/chat/create", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to create chat");
        }

        const { chatId } = await response.json();

        const userPrompt = prompt;

        router.push(`/chat/${chatId}`);

        setTimeout(() => {
          append({
            role: "user",
            content: userPrompt,
          });
          setIsProcessing(false);
        }, 100);
      } else {
        await append({
          role: "user",
          content: prompt,
        });

        setIsProcessing(false);
      }

      if (isMobile) {
        setOpenMobile(false);
      } else {
        setOpen(false);
      }
    } catch (err) {
      console.error("Failed to append topic prompt:", err);
      setIsProcessing(false);
    }
  };

  const handleNewChat = () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      resetMessages();

      router.push("/");

      if (isMobile) {
        setOpenMobile(false);
      } else {
        setOpen(false);
      }

      setTimeout(() => {
        setIsProcessing(false);
      }, 100);
    } catch (err) {
      console.error("Failed to create new chat:", err);
      setIsProcessing(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex items-center justify-between sticky top-0 z-20 bg-sidebar">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleNewChat}
          disabled={isProcessing}
        >
          <MessageSquare className="h-4 w-4" />

          <span>New Chat</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <PanelLeftClose className="h-4 w-4" />
          <span className="sr-only">Close Sidebar</span>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {TOPICS.map((topic) => (
            <SidebarMenuItem key={topic.id}>
              <SidebarMenuButton
                onClick={() => handleTopicSelect(topic.prompt)}
                disabled={isProcessing}
                className={isProcessing ? "cursor-not-allowed opacity-70" : ""}
              >
                <topic.icon className="mr-2 h-4 w-4" />
                <span>{topic.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">
          <div>AI Portfolio Assistant v1.0</div>
          <div className="mt-1 hidden md:block">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 text-xs font-semibold border rounded">
              B
            </kbd>{" "}
            to toggle sidebar
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
