"use client";

import { ChatForm } from "@/components/chat-form";
import { useEffect } from "react";

export default function LandingPage() {
  // Reset scroll position when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

    // Also reset scroll on any scrollable containers
    const scrollableElements = document.querySelectorAll(".overflow-y-auto");
    scrollableElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.scrollTop = 0;
      }
    });
  }, []);

  // Render the chat form directly here, without a chat ID
  return (
    <div className="h-full">
      <ChatForm isLanding={true} />
    </div>
  );
}
