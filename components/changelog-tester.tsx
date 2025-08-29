"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { changelogService } from '@/lib/changelog-service'
import { RefreshCw, TestTube } from 'lucide-react'

export function ChangelogTester() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      // Test 1: Load changelog data
      addTestResult('Testing changelog data loading...')
      const changelog = await changelogService.getChangelog()
      if (changelog) {
        addTestResult(`✅ Successfully loaded changelog with ${Object.keys(changelog.versions).length} versions`)
        addTestResult(`✅ Latest version: ${changelog.latest}`)
      } else {
        addTestResult('❌ Failed to load changelog data')
      }

      // Test 2: Check version comparison
      addTestResult('Testing version comparison...')
      const latestVersion = await changelogService.getLatestVersion()
      if (latestVersion) {
        addTestResult(`✅ Latest version retrieved: ${latestVersion}`)
      } else {
        addTestResult('❌ Failed to get latest version')
      }

      // Test 3: Check localStorage functionality
      addTestResult('Testing localStorage functionality...')
      const currentLastSeen = changelogService.getLastSeenVersion()
      addTestResult(`Current last seen version: ${currentLastSeen || 'none'}`)

      // Test 4: Check for new version
      const hasNew = await changelogService.hasNewVersion()
      addTestResult(`Has new version: ${hasNew ? '✅ Yes' : '❌ No'}`)

      // Test 5: Get all versions
      const allVersions = await changelogService.getAllVersions()
      addTestResult(`✅ Retrieved ${allVersions.length} version entries`)

    } catch (error) {
      addTestResult(`❌ Error during testing: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLastSeenVersion = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('realtalk_last_seen_version')
      addTestResult('✅ Cleared last seen version from localStorage')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Changelog System Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Run Tests
          </Button>
          <Button 
            variant="outline" 
            onClick={clearLastSeenVersion}
            disabled={isLoading}
          >
            Clear Last Seen
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {testResults.map((result, index) => (
                <div key={index} className="text-muted-foreground">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}