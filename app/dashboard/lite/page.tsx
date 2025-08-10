"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { ChatWindow } from "@/components/chat-window"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"

export default function LiteDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [section, setSection] = useState<'global'|'friends'|'dms'|'gc'|'settings'>('global')
  const [dmTarget, setDmTarget] = useState<{ id: string, username: string } | null>(null)

  useEffect(()=>{
    if (!loading && !user) router.push('/auth')
  },[loading,user])

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="sticky top-0 z-10 mb-4">
        <div className="glass-effect rounded-2xl border shadow-md px-3 py-2 flex items-center gap-2">
          {(['global','friends','dms','gc','settings'] as const).map(s => (
            <Button key={s} size="sm" variant={section===s? 'default':'outline'} onClick={()=> setSection(s)} className="capitalize">{s}</Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={()=> router.push('/settings')}>Settings</Button>
            <Button size="sm" variant="ghost" onClick={()=> router.push('/dashboard')}>Pro</Button>
          </div>
        </div>
      </div>

      {section==='global' && (
        <Card className="p-0 overflow-hidden">
          <div className="h-[calc(100vh-160px)]"><ChatWindow chatType="global" chatName="Global" currentUserId={user.id} /></div>
        </Card>
      )}
      {section==='friends' && (
        <Card className="p-4">
          <FriendsPage currentUserId={user.id} onStartDM={(id,un)=>{ setDmTarget({ id, username: un }); setSection('dms') }} />
        </Card>
      )}
      {section==='dms' && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 md:col-span-1">
            <DMsPage currentUserId={user.id} onSelectDM={(id,un)=>{ setDmTarget({ id, username: un }); }} />
          </Card>
          <Card className="p-0 md:col-span-2 min-h-[60vh]">
            {dmTarget ? (
              <ChatWindow chatType="dm" chatId={dmTarget.id} chatName={`@${dmTarget.username}`} currentUserId={user.id} />
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Select a conversation</div>
            )}
          </Card>
        </div>
      )}
      {section==='gc' && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 md:col-span-1">
            <div className="text-sm text-muted-foreground">Your group chats</div>
            {/* TODO: list GCs similarly to DMsPage */}
          </Card>
          <Card className="p-0 md:col-span-2 min-h-[60vh]">
            <div className="h-full grid place-items-center text-sm text-muted-foreground">Open a group chat from the list</div>
          </Card>
        </div>
      )}
      {section==='settings' && (
        <Card className="p-4 flex items-center gap-2">
          <Button onClick={()=> router.push('/settings')}>Open Settings</Button>
          <Button variant="outline" onClick={()=> router.push('/dashboard')}>Switch to Pro</Button>
        </Card>
      )}
    </div>
  )
}


