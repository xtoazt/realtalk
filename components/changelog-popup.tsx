"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Sparkles, Bug, Zap, Gift } from 'lucide-react'
import { changelogService, type ChangelogEntry } from '@/lib/changelog-service'

interface ChangelogPopupProps {
  onClose: () => void
}

export function ChangelogPopup({ onClose }: ChangelogPopupProps) {
  const [versionInfo, setVersionInfo] = useState<ChangelogEntry | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const loadVersionInfo = async () => {
      const newVersionInfo = await changelogService.getNewVersionInfo()
      if (newVersionInfo) {
        setVersionInfo(newVersionInfo)
        setIsVisible(true)
      } else {
        onClose()
      }
    }
    
    loadVersionInfo()
  }, [onClose])

  const handleDismiss = () => {
    if (versionInfo) {
      changelogService.markVersionAsSeen(versionInfo.version)
    }
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major':
        return <Gift className="h-5 w-5 text-red-500" />
      case 'minor':
        return <Sparkles className="h-5 w-5 text-blue-500" />
      case 'patch':
        return <Bug className="h-5 w-5 text-green-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getVersionTitle = (type: string) => {
    switch (type) {
      case 'major':
        return 'Major Update'
      case 'minor':
        return 'New Features'
      case 'patch':
        return 'Bug Fixes & Improvements'
      default:
        return 'Update'
    }
  }

  if (!versionInfo) {
    return null
  }

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Card className={`w-full max-w-lg bg-background/95 backdrop-blur-sm border-2 transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 pr-10">
            {getVersionIcon(versionInfo.type)}
            <div>
              <CardTitle className="text-xl">
                What's New in v{versionInfo.version}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${changelogService.getVersionBadgeColor(versionInfo.type)}`}>
                  {getVersionTitle(versionInfo.type)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {changelogService.formatDate(versionInfo.date)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{versionInfo.title}</h3>
            <ul className="space-y-2">
              {versionInfo.changes.map((change, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleDismiss}>
              Maybe Later
            </Button>
            <Button onClick={handleDismiss} className="bg-primary hover:bg-primary/90">
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ChangelogManagerProps {
  children?: React.ReactNode
}

export function ChangelogManager({ children }: ChangelogManagerProps) {
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    const checkForNewVersion = async () => {
      try {
        const hasNew = await changelogService.hasNewVersion()
        if (hasNew) {
          // Small delay to ensure the app has loaded
          setTimeout(() => setShowPopup(true), 1000)
        }
      } catch (error) {
        console.error('Error checking for new version:', error)
      }
    }

    checkForNewVersion()
  }, [])

  return (
    <>
      {children}
      {showPopup && (
        <ChangelogPopup onClose={() => setShowPopup(false)} />
      )}
    </>
  )
}