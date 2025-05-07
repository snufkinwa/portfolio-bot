"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect, type TextareaHTMLAttributes } from "react"

interface AutoResizeTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
}

export function AutoResizeTextarea({ className, value, onChange, ...props }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const newHeight = Math.min(textarea.scrollHeight, 128) // Max height of 128px (8rem)
      textarea.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    resizeTextarea()
  }, [value])

  return (
    <textarea
      {...props}
      value={value}
      ref={textareaRef}
      rows={1}
      onChange={(e) => {
        onChange(e.target.value)
        resizeTextarea()
      }}
      className={cn("resize-none min-h-6 py-1 overflow-hidden", className)}
    />
  )
}
