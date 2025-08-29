interface NotificationData {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: any
  onClick?: () => void
}

class NotificationService {
  private static instance: NotificationService
  private isSupported: boolean = false
  private permission: NotificationPermission = 'default'
  private isTabActive: boolean = true

  private constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window
      this.permission = this.isSupported ? Notification.permission : 'denied'
      this.setupVisibilityListener()
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isTabActive = !document.hidden
      })
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isSupported) return false

    if (this.permission === 'granted') return true

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  public async showNotification(data: NotificationData): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isSupported || this.permission !== 'granted' || this.isTabActive) {
      return false
    }
    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.png',
        tag: data.tag,
        badge: '/favicon.png',
        requireInteraction: false,
        silent: false,
        data: data.data
      })
      // Only close on click
      notification.onclick = () => {
        window.focus()
        data.onClick?.()
        notification.close()
      }
      return true
    } catch (error) {
      // Show a user-friendly error message if needed (could be a toast in the UI)
      return false
    }
  }

  public async showMessageNotification(
    message: {
      content: string
      username: string
      chatType: string
      chatName: string
      chatId?: string
      messageType?: string
      id: string
    },
    onNavigateToChat?: (chatType: string, chatName: string, chatId?: string) => void
  ): Promise<boolean> {
    const title = message.chatType === "dm"
      ? `New DM from ${message.username}`
      : message.chatType === "group" || message.chatType === "channel"
        ? `New message in ${message.chatName}`
        : `New global message from ${message.username}`

    const body = message.messageType === "image"
      ? "📷 Sent an image"
      : message.content.length > 100
        ? message.content.substring(0, 100) + "..."
        : message.content

    return this.showNotification({
      title,
      body,
      tag: `message-${message.id}`,
      data: {
        chatType: message.chatType,
        chatId: message.chatId,
        chatName: message.chatName,
        messageId: message.id
      },
      onClick: () => {
        if (onNavigateToChat) {
          onNavigateToChat(message.chatType, message.chatName, message.chatId)
        }
      }
    })
  }

  public getIsTabActive(): boolean {
    return this.isTabActive
  }

  public getPermission(): NotificationPermission {
    return this.permission
  }

  public getIsSupported(): boolean {
    return this.isSupported
  }

  public updatePermission(): void {
    if (typeof window !== 'undefined' && this.isSupported) {
      this.permission = Notification.permission
    }
  }
}

export const notificationService = NotificationService.getInstance()
