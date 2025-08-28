"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { addGeminiAPIKey, getGeminiKeyStatus } from "@/lib/gemini"
import { Button } from "@/components/ui/button"

interface GoldMemberPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function GoldMemberPopup({ isOpen, onClose }: GoldMemberPopupProps) {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [keyStatus, setKeyStatus] = useState<any>(null)
  const { user } = useUser()

  const isGoldMember = user?.signup_code === 'qwea'

  useEffect(() => {
    if (isOpen) {
      loadKeyStatus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyExhausted = () => {
      if (isGoldMember) {
        // The popup will be shown by the parent component
      }
    }
    window.addEventListener('geminiKeyExhausted', handleKeyExhausted)
    return () => window.removeEventListener('geminiKeyExhausted', handleKeyExhausted)
  }, [isGoldMember])

  const loadKeyStatus = () => {
    setKeyStatus(getGeminiKeyStatus())
  }

  const handleAddKey = async () => {
    if (!apiKey.trim()) {
      setMessage("Please enter a valid API key")
      return
    }
    setIsLoading(true)
    setMessage("")
    try {
      const result = await addGeminiAPIKey(apiKey, user?.username || 'Unknown')
      if (result.success) {
        setMessage("API key added successfully! 🎉")
        setApiKey("")
        loadKeyStatus()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage("Error adding API key. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadKeyStatus()
    setMessage("Key status refreshed")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">Gemini API Key Management</h2>
        {!isGoldMember && (
          <div className="text-red-600 mb-4">Only gold members can add or manage Gemini API keys.</div>
        )}
        {keyStatus?.error && (
          <div className="text-red-600 mb-2">{keyStatus.error}</div>
        )}
        {!keyStatus?.hasAvailableKeys && (
          <div className="text-yellow-600 mb-2">No available Gemini API keys. Please add a new one to restore AI features for all users.</div>
        )}
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-1">Current keys: {keyStatus?.totalKeys ?? 0}</div>
          <div className="text-sm text-muted-foreground mb-1">Exhausted keys: {keyStatus?.exhaustedKeys ?? 0}</div>
        </div>
        {isGoldMember && (
          <div className="mb-4">
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Enter Gemini API key (starts with AIza)"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleAddKey} disabled={isLoading} className="w-full mb-2">
              {isLoading ? "Adding..." : "Add API Key"}
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="w-full">
              Refresh Key Status
            </Button>
          </div>
        )}
        {message && <div className="text-sm text-blue-600 mb-2">{message}</div>}
        <Button onClick={onClose} variant="secondary" className="w-full mt-2">Close</Button>
      </div>
    </div>
  )
}
