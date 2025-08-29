"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Gift, Sparkles, Bug, Zap, Calendar, ChevronRight, ChevronDown } from 'lucide-react'
import { changelogService, type ChangelogEntry } from '@/lib/changelog-service'

export function ChangelogViewer() {
  const [versions, setVersions] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const allVersions = await changelogService.getAllVersions()
        setVersions(allVersions)
        // Auto-expand the latest version
        if (allVersions.length > 0) {
          setExpandedVersions(new Set([allVersions[0].version]))
        }
      } catch (error) {
        console.error('Error loading changelog:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadVersions()
  }, [])

  const toggleVersionExpansion = (version: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(version)) {
      newExpanded.delete(version)
    } else {
      newExpanded.add(version)
    }
    setExpandedVersions(newExpanded)
  }

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major':
        return <Gift className="h-4 w-4 text-red-500" />
      case 'minor':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      case 'patch':
        return <Bug className="h-4 w-4 text-green-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Changelog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Changelog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No changelog data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Changelog
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Version history and updates for real.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-4 py-4">
            {versions.map((version, index) => {
              const isExpanded = expandedVersions.has(version.version)
              const isLatest = index === 0
              
              return (
                <div key={version.version} className="space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => toggleVersionExpansion(version.version)}
                    className="w-full justify-between p-0 h-auto hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 text-left">
                      {getVersionIcon(version.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">v{version.version}</span>
                          {isLatest && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                              Latest
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${changelogService.getVersionBadgeColor(version.type)}`}>
                            {version.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{changelogService.formatDate(version.date)}</span>
                          <span>•</span>
                          <span>{version.title}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  
                  {isExpanded && (
                    <div className="ml-7 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">{version.title}</h4>
                        <ul className="space-y-1.5">
                          {version.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="flex items-start gap-2 text-xs">
                              <span className="text-primary mt-0.5 text-lg leading-none">•</span>
                              <span className="text-muted-foreground">{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {index < versions.length - 1 && <Separator className="my-4" />}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}