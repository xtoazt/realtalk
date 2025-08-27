"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Send, 
  Smile, 
  Image, 
  Mic, 
  Sparkles, 
  Lightbulb, 
  Shield,
  Languages,
  Brain,
  Zap
} from "lucide-react"
import { 
  generateSmartSuggestions, 
  moderateContent,
  AI_PERSONAS 
} from "@/lib/gemini"

interface SmartChatInputProps {
  onSendMessage: (message: string, type?: string) => void
  onImageUpload?: (file: File) => void
  chatType: string
  chatName?: string
  currentUser: string
  messageHistory?: Array<{ role: string; content: string }>
  userPreferences?: any
  disabled?: boolean
}

export function SmartChatInput({
  onSendMessage,
  onImageUpload,
  chatType,
  chatName,
  currentUser,
  messageHistory = [],
  userPreferences,
  disabled = false
}: SmartChatInputProps) {
  const [message, setMessage] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [moderation, setModeration] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('assistant')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Smart analysis when message changes
  useEffect(() => {
    if (message.length > 10) {
      analyzeMessage(message)
    } else {
      setModeration(null)
      setSuggestions([])
    }
  }, [message])

  const analyzeMessage = async (text: string) => {
    setIsAnalyzing(true)
    
    try {
      const context = {
        chatType,
        chatName,
        username: currentUser,
        messageHistory,
        userPreferences,
        currentTime: new Date().toLocaleTimeString()
      }

      // Parallel analysis
      const [moderationResult, suggestionsResult] = await Promise.all([
        moderateContent(text),
        generateSmartSuggestions(text, context)
      ])

      setModeration(moderationResult)
      setSuggestions(suggestionsResult || [])
    } catch (error) {
      console.error('Error analyzing message:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      setSuggestions([])
      setModeration(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    setShowSuggestions(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      onImageUpload(file)
    }
  }



  const getModerationColor = (isAppropriate: boolean) => {
    return isAppropriate ? 'text-green-500' : 'text-red-500'
  }

  return (
    <div className="space-y-4">
      {/* Smart Analysis Indicators */}
      {isAnalyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Brain className="h-4 w-4" />
          <span>Analyzing message...</span>
        </div>
      )}

      {/* Moderation Display */}
      {moderation && (
        <div className="flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1 ${getModerationColor(moderation.isAppropriate)}`}>
            <Shield className="h-3 w-3" />
            <span>{moderation.isAppropriate ? 'Appropriate' : 'Flagged'}</span>
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && showSuggestions && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs hover:bg-accent"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}



      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px] resize-none pr-20"
            disabled={disabled}
          />
          
          {/* Smart Features Overlay */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {suggestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="h-6 w-6 p-0"
                title="Smart suggestions"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* AI Persona Selector */}
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as keyof typeof AI_PERSONAS)}
            className="text-xs bg-background border border-input rounded px-2 py-1"
            title="AI Persona"
          >
            {Object.entries(AI_PERSONAS).map(([key, persona]) => (
              <option key={key} value={key}>
                {persona.name}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="Upload image"
          >
            <Image className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />



      {/* Smart Features Status */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          <span>Smart features enabled</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          <span>AI-powered moderation</span>
        </div>
      </div>
    </div>
  )
}
