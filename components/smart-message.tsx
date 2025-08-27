"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  MoreHorizontal,
  Brain,
  Sparkles,
  Eye,
  Clock,
  User,
  Bot,
  Lightbulb,
  Zap
} from "lucide-react"
import { moderateContent } from "@/lib/gemini"

interface SmartMessageProps {
  message: {
    id: string
    content: string
    sender_id: string
    username: string
    name_color?: string
    custom_title?: string
    has_gold_animation?: boolean
    is_ai_response?: boolean
    created_at: string
    mentions?: string[]
    parent_message_id?: string
    parent_message_content?: string
    parent_message_username?: string
    message_type?: string
    reactions?: { emoji: string; count: number; reacted_by_me: boolean }[]
  }
  currentUserId: string
  onUserClick?: (userId: string) => void
  onReply?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  showAI?: boolean
}

export function SmartMessage({
  message,
  currentUserId,
  onUserClick,
  onReply,
  onReaction,
  showAI = true
}: SmartMessageProps) {
  const [moderation, setModeration] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [aiInsights, setAiInsights] = useState<any>({})

  const isOwnMessage = message.sender_id === currentUserId
  const isAI = message.is_ai_response

  // Analyze message when component mounts
  useEffect(() => {
    if (showAI && message.content.length > 10) {
      analyzeMessage()
    }
  }, [message.content, showAI])

  const analyzeMessage = async () => {
    setIsAnalyzing(true)
    
    try {
      const moderationResult = await moderateContent(message.content)

      setModeration(moderationResult)

      // Generate AI insights
      setAiInsights({
        complexity: analyzeComplexity(message.content),
        tone: analyzeTone(message.content),
        intent: analyzeIntent(message.content),
        keywords: extractKeywords(message.content)
      })
    } catch (error) {
      console.error('Error analyzing message:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeComplexity = (text: string) => {
    const words = text.split(' ').length
    const sentences = text.split(/[.!?]+/).length
    const avgWordsPerSentence = words / sentences
    
    if (avgWordsPerSentence > 15) return 'complex'
    if (avgWordsPerSentence > 10) return 'moderate'
    return 'simple'
  }

  const analyzeTone = (text: string) => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('!') || lowerText.includes('😊') || lowerText.includes('😄')) return 'excited'
    if (lowerText.includes('?') || lowerText.includes('🤔') || lowerText.includes('hmm')) return 'curious'
    if (lowerText.includes('😢') || lowerText.includes('😭') || lowerText.includes('sad')) return 'sad'
    if (lowerText.includes('😡') || lowerText.includes('angry') || lowerText.includes('frustrated')) return 'angry'
    if (lowerText.includes('❤️') || lowerText.includes('love') || lowerText.includes('amazing')) return 'loving'
    
    return 'neutral'
  }

  const analyzeIntent = (text: string) => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('?')) return 'question'
    if (lowerText.includes('!')) return 'exclamation'
    if (lowerText.includes('thank') || lowerText.includes('thanks')) return 'gratitude'
    if (lowerText.includes('sorry') || lowerText.includes('apologize')) return 'apology'
    if (lowerText.includes('help') || lowerText.includes('assist')) return 'request'
    
    return 'statement'
  }

  const extractKeywords = (text: string) => {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']
    const words = text.toLowerCase().split(/\W+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    )
    
    const wordCount: { [key: string]: number } = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word)
  }



  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'excited': return 'text-yellow-500'
      case 'curious': return 'text-blue-500'
      case 'sad': return 'text-blue-400'
      case 'angry': return 'text-red-500'
      case 'loving': return 'text-pink-500'
      default: return 'text-gray-500'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'complex': return 'text-purple-500'
      case 'moderate': return 'text-orange-500'
      case 'simple': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`group relative ${isOwnMessage ? 'ml-auto' : 'mr-auto'} max-w-[80%] mb-4`}>
      <Card className={`${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-card'} ${isAI ? 'border-l-4 border-l-blue-500' : ''}`}>
        <CardContent className="p-3">
          {/* Message Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {isAI ? (
                <Bot className="h-4 w-4 text-blue-500" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span 
                className={`font-medium text-sm cursor-pointer hover:underline ${isOwnMessage ? 'text-primary-foreground' : ''}`}
                onClick={() => onUserClick?.(message.sender_id)}
                style={{ color: message.name_color }}
              >
                {message.username}
              </span>
              {message.custom_title && (
                <span className="text-xs opacity-70">({message.custom_title})</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Clock className="h-3 w-3" />
              <span>{formatTime(message.created_at)}</span>
            </div>

            {/* AI Analysis Indicators */}
            {showAI && moderation && (
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${moderation.isAppropriate ? 'bg-green-500' : 'bg-red-500'}`} title={moderation.isAppropriate ? 'Appropriate' : 'Flagged'} />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="mb-2">
            {message.parent_message_content && (
              <div className="text-xs opacity-70 mb-1 p-2 bg-muted rounded">
                <span className="font-medium">Replying to {message.parent_message_username}:</span> {message.parent_message_content}
              </div>
            )}
            
            <div className="text-sm">
              {message.content}
            </div>

            {message.message_type === 'image' && (
              <div className="mt-2 text-xs opacity-70">
                📷 Image shared
              </div>
            )}
          </div>

          {/* AI Insights */}
          {showAI && Object.keys(aiInsights).length > 0 && showDetails && (
            <div className="mt-3 p-2 bg-muted/50 rounded text-xs space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3" />
                <span className="font-medium">AI Insights:</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Tone:</span>
                  <span className={getToneColor(aiInsights.tone)}>{aiInsights.tone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Complexity:</span>
                  <span className={getComplexityColor(aiInsights.complexity)}>{aiInsights.complexity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Intent:</span>
                  <span className="capitalize">{aiInsights.intent}</span>
                </div>
                {aiInsights.keywords.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="opacity-70">Keywords:</span>
                    <span className="text-blue-500">{aiInsights.keywords.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {/* Reactions */}
              {message.reactions?.map((reaction, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction?.(message.id, reaction.emoji)}
                  className={`h-6 px-2 text-xs ${reaction.reacted_by_me ? 'bg-primary/20' : ''}`}
                >
                  {reaction.emoji} {reaction.count}
                </Button>
              ))}

              {/* Quick Reactions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction?.(message.id, '👍')}
                  className="h-6 w-6 p-0"
                >
                  👍
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction?.(message.id, '❤️')}
                  className="h-6 w-6 p-0"
                >
                  ❤️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction?.(message.id, '😊')}
                  className="h-6 w-6 p-0"
                >
                  😊
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reply Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message.id)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>

              {/* AI Analysis Toggle */}
              {showAI && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="AI Analysis"
                >
                  <Brain className="h-3 w-3" />
                </Button>
              )}

              {/* More Options */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Analysis Loading State */}
          {isAnalyzing && (
            <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
              <span>Analyzing message...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Features Badge */}
      {showAI && (moderation || Object.keys(aiInsights).length > 0) && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Sparkles className="h-3 w-3" />
        </div>
      )}
    </div>
  )
}
