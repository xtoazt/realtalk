"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Bot, 
  Brain, 
  Lightbulb, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  TrendingUp,
  Users,
  Clock,
  Zap,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { 
  generateAIResponse,
  generateConversationSummary,
  AI_PERSONAS,
  SMART_FEATURES
} from "@/lib/gemini"

interface SmartAIAssistantProps {
  chatType: string
  chatName?: string
  currentUser: string
  messageHistory: Array<{ 
    content: string; 
    username: string; 
    timestamp: string;
    isAI?: boolean;
  }>
  userPreferences?: any
  onSendMessage?: (message: string) => void
}

export function SmartAIAssistant({
  chatType,
  chatName,
  currentUser,
  messageHistory,
  userPreferences,
  onSendMessage
}: SmartAIAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<keyof typeof AI_PERSONAS>('assistant')
  const [aiResponse, setAiResponse] = useState<string>("")
  const [summary, setSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string>("")
  const [insights, setInsights] = useState<any>({})

  // Generate insights when message history changes
  useEffect(() => {
    if (messageHistory.length > 0) {
      generateInsights()
    }
  }, [messageHistory])

  const generateInsights = async () => {
    if (messageHistory.length < 3) return

    try {
      // Generate summary for longer conversations
      if (messageHistory.length > 5) {
        const summaryResult = await generateConversationSummary(messageHistory)
        setSummary(summaryResult)
      }

      // Analyze conversation patterns
      const recentMessages = messageHistory.slice(-10)
      const userMessages = recentMessages.filter(msg => !msg.isAI)
      const aiMessages = recentMessages.filter(msg => msg.isAI)

      setInsights({
        totalMessages: messageHistory.length,
        userMessages: userMessages.length,
        aiMessages: aiMessages.length,
        conversationPace: calculateConversationPace(messageHistory),
        activeParticipants: getActiveParticipants(messageHistory),
        lastActivity: getLastActivity(messageHistory)
      })
    } catch (error) {
      console.error('Error generating insights:', error)
    }
  }

  const calculateConversationPace = (messages: any[]) => {
    if (messages.length < 2) return 'slow'
    
    const timeSpan = new Date(messages[messages.length - 1].timestamp).getTime() - 
                    new Date(messages[0].timestamp).getTime()
    const messagesPerMinute = (messages.length / (timeSpan / 60000))
    
    if (messagesPerMinute > 2) return 'fast'
    if (messagesPerMinute > 0.5) return 'moderate'
    return 'slow'
  }

  const getActiveParticipants = (messages: any[]) => {
    const participants = new Set(messages.map(msg => msg.username))
    return Array.from(participants)
  }

  const getLastActivity = (messages: any[]) => {
    if (messages.length === 0) return 'No activity'
    
    const lastMessage = messages[messages.length - 1]
    const lastTime = new Date(lastMessage.timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - lastTime.getTime()) / 60000)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  const handleGenerateResponse = async () => {
    if (!messageHistory.length) return

    setIsGenerating(true)
    setActiveFeature('response')

    try {
      const lastMessage = messageHistory[messageHistory.length - 1]
      const context = {
        chatType,
        username: currentUser,
        messageHistory: messageHistory.slice(-5).map(msg => ({
          role: msg.isAI ? 'assistant' : 'user',
          content: msg.content
        }))
      }

      const response = await generateAIResponse(lastMessage.content, context, selectedPersona)
      setAiResponse(response.content)
    } catch (error) {
      console.error('Error generating AI response:', error)
      setAiResponse("I'm having trouble thinking right now. Could you try rephrasing that?")
    } finally {
      setIsGenerating(false)
    }
  }



  const handleSendAIResponse = () => {
    if (aiResponse && onSendMessage) {
      onSendMessage(aiResponse)
      setAiResponse("")
    }
  }

  const getPersonaIcon = (persona: keyof typeof AI_PERSONAS) => {
    switch (persona) {
      case 'tutor': return <BookOpen className="h-4 w-4" />
      case 'creative': return <Sparkles className="h-4 w-4" />
      case 'assistant': return <Bot className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getConversationPaceColor = (pace: string) => {
    switch (pace) {
      case 'fast': return 'text-green-500'
      case 'moderate': return 'text-yellow-500'
      case 'slow': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className="glass animate-fadeIn">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Smart AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Persona Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">AI Persona:</span>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as keyof typeof AI_PERSONAS)}
            className="text-sm bg-background border border-input rounded px-2 py-1"
          >
            {Object.entries(AI_PERSONAS).map(([key, persona]) => (
              <option key={key} value={key}>
                {persona.name}
              </option>
            ))}
          </select>
          {getPersonaIcon(selectedPersona)}
        </div>

        {/* Conversation Insights */}
        {Object.keys(insights).length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{insights.totalMessages} messages</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{insights.activeParticipants?.length || 0} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className={getConversationPaceColor(insights.conversationPace)}>
                {insights.conversationPace} pace
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{insights.lastActivity}</span>
            </div>
          </div>
        )}

        {/* Smart Summary */}
        {summary && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Conversation Summary</span>
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}

        {/* AI Response Generation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateResponse}
              disabled={isGenerating || !messageHistory.length}
              className="flex-1"
            >
              {isGenerating && activeFeature === 'response' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              Generate AI Response
            </Button>
            

          </div>

          {/* Generated AI Response */}
          {aiResponse && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">
                  {AI_PERSONAS[selectedPersona].name} Response:
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendAIResponse}
                    className="h-6 w-6 p-0"
                    title="Send this response"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiResponse("")}
                    className="h-6 w-6 p-0"
                    title="Clear response"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm">{aiResponse}</p>
            </div>
          )}


        </div>

        {/* Smart Features Status */}
        {isExpanded && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2">Smart Features:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(SMART_FEATURES).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
