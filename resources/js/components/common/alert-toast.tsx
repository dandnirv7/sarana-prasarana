"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

interface AlertToastProps {
  type: "success" | "error"
  message: string
  duration?: number
  onClose?: () => void
}

export default function AlertToast({ type, message, duration = 3000, onClose }: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 ${
        type === "success"
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            type === "success" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"
          }`}
        >
          {message}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
