'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, User, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  type: string
  isRead: boolean
  createdAt: string
}

interface MessagingSystemProps {
  workOrderId: string
  currentUserId: string
  currentUserRole: string
}

export default function MessagingSystem({ workOrderId, currentUserId, currentUserRole }: MessagingSystemProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [workOrderId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?workOrderId=${workOrderId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workOrderId,
          content: newMessage.trim(),
          type: 'TEXT'
        })
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT'
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getSenderIcon = (role: string) => {
    return role === 'CLIENT' ? <User className="h-4 w-4" /> : <Wrench className="h-4 w-4" />
  }

  const getSenderColor = (senderId: string, senderRole: string) => {
    if (senderId === currentUserId) {
      return 'bg-blue-100 border-blue-200 ml-12'
    }
    return senderRole === 'CLIENT' ? 'bg-gray-100 border-gray-200 mr-12' : 'bg-green-100 border-green-200 mr-12'
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="h-5 w-5 mr-2" />
          Mensajes
          <Badge variant="outline" className="ml-2">
            {messages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages List */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 pr-4 mb-4"
        >
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg border ${getSenderColor(message.senderId, message.senderRole)}`}
                  onClick={() => !message.isRead && markAsRead(message.id)}
                >
                  <div className="flex items-center mb-1">
                    {getSenderIcon(message.senderRole)}
                    <span className="text-xs font-medium ml-1">
                      {message.senderName}
                    </span>
                    {!message.isRead && message.senderId !== currentUserId && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            size="sm"
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}