"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

interface SourceCitationProps {
  source: string
  url?: string
}

export function SourceCitation({ source, url }: SourceCitationProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="mt-2 text-xs">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-muted-foreground flex items-center gap-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <span>Source: {source}</span>
      </Button>

      {expanded && url && (
        <div className="pl-6 pt-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            View source <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}
