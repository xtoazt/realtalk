"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Check, User, Clock } from "lucide-react"

interface JoinRequest {
  id: string
  requester_id: string
  username: string
  name_color?: string
  custom_title?: string
  has_gold_animation?: boolean
  created_at: string
}

interface JoinRequestsProps {
  groupChatId: string
  groupChatName: string
  onClose: () => void
  onRequestProcessed: () => void
}

export function JoinRequests({ groupChatId, groupChatName, onClose, onRequestProcessed }: JoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [groupChatId])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/group-chats/${groupChatId}/requests`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (requestId: string, requesterId: string, action: 'approve' | 'reject') => {
    setProcessing(requestId)
    try {
      const response = await fetch(`/api/group-chats/${groupChatId}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, requesterId, action }),
      })

      if (response.ok) {
        // Remove the processed request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId))
        onRequestProcessed()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to process request")
      }
    } catch (error) {
      alert("An error occurred while processing the request")
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading requests...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Join Requests
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-2">
            <p className="text-sm text-muted-foreground mb-4">
              Pending requests for <strong>{groupChatName}</strong>
            </p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-2 px-6 pb-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          @{request.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequest(request.id, request.requester_id, 'approve')}
                        disabled={processing === request.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRequest(request.id, request.requester_id, 'reject')}
                        disabled={processing === request.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
