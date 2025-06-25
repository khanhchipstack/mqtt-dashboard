"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ErrorDisplayProps {
  message: string
  onRetry: () => void
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-red-400 text-lg mb-4">{message}</div>
      <Button onClick={onRetry} variant="outline" className="border-gray-600 text-gray-300">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  )
}
