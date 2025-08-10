"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FriendsPage } from "@/components/friends-page"
import { ChatWindow } from "@/components/chat-window"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"

export default function LiteDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [section, setSection] = useState<'global'|'friends'|'dms'|'gc'|'settings'>('global')

  useEffect(()=>{
    if (!loading && !user) router.push('/auth')
  },[loading,user])

  if (!user) return null

  return (
    <div className="max-w-5xl mx-auto p-3">
      <div className="sticky top-0 z-10 bg-background/70 backdrop-blur border-b mb-3">
        <div className="flex gap-2 p-2">
          {(['global','friends','dms','gc','settings'] as const).map(s => (
            <Button key={s} size="sm" variant={section===s? 'default':'outline'} onClick={()=> setSection(s)} className="capitalize">{s}</Button>
          ))}
          <div className="ml-auto">
            <Button size="sm" variant="ghost" onClick={()=> router.push('/dashboard')}>Pro</Button>
          </div>
        </div>
      </div>

      {section==='global' && (
        <div className="h-[calc(100vh-140px)]"><ChatWindow chatType="global" chatName="Global" currentUserId={user.id} /></div>
      )}
      {section==='friends' && (
        <FriendsPage currentUserId={user.id} onStartDM={(id,un)=>{ setSection('dms') }} />
      )}
      {section==='dms' && (
        <div className="text-sm text-muted-foreground">Open a DM from Friends for now.</div>
      )}
      {section==='gc' && (
        <div className="text-sm text-muted-foreground">Group chats coming soon in Lite. Use Pro for full features.</div>
      )}
      {section==='settings' && (
        <div className="flex gap-2">
          <Button onClick={()=> router.push('/settings')}>Open Settings</Button>
          <Button variant="outline" onClick={()=> router.push('/dashboard')}>Switch to Pro</Button>
        </div>
      )}
    </div>
  )
}


