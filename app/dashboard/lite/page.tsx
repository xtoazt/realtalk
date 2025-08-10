"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FriendsPage } from "@/components/friends-page"
import { DMsPage } from "@/components/dms-page"
import { ChatWindow } from "@/components/chat-window"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import SettingsPage from "@/app/settings/page"
import { TimeDateDisplay } from "@/components/time-date-display"
import { BatteryStatus } from "@/components/BatteryStatus"

export default function LiteDashboard() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [section, setSection] = useState<'home'|'global'|'friends'|'dms'|'gc'|'settings'>('home')
  const [dmTarget, setDmTarget] = useState<{ id: string, username: string } | null>(null)

  useEffect(()=>{
    if (!loading && !user) router.push('/auth')
  },[loading,user])

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="sticky top-0 z-10 mb-4">
        <div className="glass-effect rounded-2xl border shadow-md px-3 py-2 flex items-center gap-2">
          {(['home','global','friends','dms','gc','settings'] as const).map(s => (
            <Button key={s} size="sm" variant={section===s? 'default':'outline'} onClick={()=> setSection(s)} className="capitalize">{s}</Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={()=> router.push('/settings')}>Settings</Button>
          </div>
        </div>
      </div>

      {section==='home' && (
        <>
        <div className="text-center py-10">
          <div className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">real.</div>
          <div className="mt-3 flex flex-col items-center gap-2">
            <TimeDateDisplay large />
            <BatteryStatus />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={()=> setSection('global')}>
            <div className="text-sm text-muted-foreground mb-1">Chat</div>
            <div className="text-xl font-semibold">Global</div>
            <div className="mt-2 text-xs text-muted-foreground">Talk to everyone in real-time.</div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={()=> setSection('friends')}>
            <div className="text-sm text-muted-foreground mb-1">Social</div>
            <div className="text-xl font-semibold">Friends</div>
            <div className="mt-2 text-xs text-muted-foreground">Manage and find friends.</div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={()=> setSection('dms')}>
            <div className="text-sm text-muted-foreground mb-1">Messages</div>
            <div className="text-xl font-semibold">DMs</div>
            <div className="mt-2 text-xs text-muted-foreground">Direct conversations.</div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={()=> setSection('gc')}>
            <div className="text-sm text-muted-foreground mb-1">Groups</div>
            <div className="text-xl font-semibold">Group Chats</div>
            <div className="mt-2 text-xs text-muted-foreground">Chat with your circles.</div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition cursor-pointer" onClick={()=> setSection('settings')}>
            <div className="text-sm text-muted-foreground mb-1">Preferences</div>
            <div className="text-xl font-semibold">Settings</div>
            <div className="mt-2 text-xs text-muted-foreground">Themes, notifications, and more.</div>
          </Card>
        </div>
        </>
      )}

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
        <Card className="p-4">
          <SettingsPage />
        </Card>
      )}
    </div>
  )
}


