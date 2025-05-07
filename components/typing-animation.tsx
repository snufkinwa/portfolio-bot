"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function TypingAnimation({
  text,
  isThinking,
}: {
  text: string;
  isThinking: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (isThinking || index >= text.length) return;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => prev + text[index]);
      setIndex((prev) => prev + 1);
    }, 15);

    return () => clearTimeout(timeout);
  }, [index, text, isThinking]);

  if (isThinking) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Thinking...</span>
      </div>
    );
  }

  return (
    <>
      {displayedText}
      {index < text.length && <span className="animate-pulse">▋</span>}
    </>
  );
}
