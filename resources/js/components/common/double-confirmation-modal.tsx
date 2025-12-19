"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Modal from "./modal"

interface DoubleConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DoubleConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDangerous = false,
  onConfirm,
  onCancel,
}: DoubleConfirmationModalProps) {
  const [step, setStep] = useState<"first" | "second">("first")

  const handleFirstConfirm = () => {
    setStep("second")
  }

  const handleSecondConfirm = () => {
    onConfirm()
    setStep("first")
  }

  const handleClose = () => {
    setStep("first")
    onCancel()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 ${isDangerous ? "text-red-500" : "text-yellow-500"}`}
            aria-hidden="true"
          />
          <p className="text-sm text-foreground">
            {step === "first" ? message : "Mohon konfirmasi lagi untuk melanjutkan tindakan ini."}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} aria-label={`${cancelText} tindakan ${title.toLowerCase()}`}>
            {cancelText}
          </Button>
          {step === "first" ? (
            <Button
              onClick={handleFirstConfirm}
              variant={isDangerous ? "destructive" : "default"}
              aria-label={`Konfirmasi pertama untuk ${title.toLowerCase()}`}
            >
              {confirmText}
            </Button>
          ) : (
            <Button
              onClick={handleSecondConfirm}
              variant={isDangerous ? "destructive" : "default"}
              aria-label={`Konfirmasi kedua untuk ${title.toLowerCase()}`}
            >
              Konfirmasi Lagi
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
