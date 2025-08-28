"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Crown, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  X,
  RefreshCw,
  Shield
} from "lucide-react"
import { addGeminiAPIKey, getGeminiKeyStatus } from "@/lib/gemini"
import { useUser } from "@/hooks/use-user"

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

  const loadKeyStatus = async () => {
    try {
      const status = getGeminiKeyStatus()
      setKeyStatus(status)
    } catch (error) {
      setMessage('Error loading key status')
    }
  }

  const handleAddKey = async () => {
    if (!apiKey.trim()) {
      setMessage("Please enter a valid API key")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const success = await addGeminiAPIKey(apiKey, user?.username || 'Unknown')
      
      if (success) {
        setMessage("API key added successfully! 🎉")
        setApiKey("")
        loadKeyStatus()
      } else {
        setMessage("Failed to add API key. Please check the key and try again.")
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
      <Card className="w-full max-w-md glass animate-fadeIn">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-yellow-500" />
              Gold Member Access
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alert Message */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Gemini API Keys Exhausted
              </span>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              All available API keys have been used up. Add a new key to restore AI functionality for all users.
            </p>
          </div>

          {/* Key Status */}
          {keyStatus && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Current Status</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${keyStatus.hasAvailableKeys ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{keyStatus.hasAvailableKeys ? 'Available' : 'Exhausted'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  <span>{keyStatus.totalKeys} keys</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>{keyStatus.exhaustedKeys} exhausted</span>
                </div>
              </div>
            </div>
          )}

          {/* Add New Key Form */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Add New Gemini API Key
              </label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <Button
              onClick={handleAddKey}
              disabled={isLoading || !apiKey.trim()}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Adding Key...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Add API Key
                </div>
              )}
            </Button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('successfully') 
                ? 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300' 
                : 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('successfully') ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              How it works:
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• New keys are automatically used by all users</li>
              <li>• Keys are rotated when they reach their limit</li>
              <li>• Your key remains secure and private</li>
              <li>• All users benefit from your contribution</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
