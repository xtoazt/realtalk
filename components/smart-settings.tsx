"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Languages, 
  Eye, 
  Mic, 
  MessageSquare,
  Zap,
  Settings,
  User,
  Palette,
  Bell
} from "lucide-react"
import { SMART_FEATURES, AI_PERSONAS } from "@/lib/gemini"

interface SmartSettingsProps {
  user: any
  onUpdateSettings: (settings: any) => Promise<void>
}

export function SmartSettings({ user, onUpdateSettings }: SmartSettingsProps) {
  const [smartFeatures, setSmartFeatures] = useState(SMART_FEATURES)
  const [aiPreferences, setAiPreferences] = useState({
    defaultPersona: 'assistant',
    autoAnalyze: true,
    smartSuggestions: true,
    contentModeration: true,
    sentimentAnalysis: true,
    languageTranslation: true,
    imageAnalysis: true,
    voiceToText: false,
    smartSummaries: true,
    contextualHelp: true,
    personalizedResponses: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load user preferences from localStorage or user settings
    const savedPreferences = localStorage.getItem('ai-preferences')
    if (savedPreferences) {
      setAiPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  const handleFeatureToggle = (feature: string) => {
    setSmartFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature as keyof typeof SMART_FEATURES]
    }))
  }

  const handlePreferenceChange = (preference: string, value: any) => {
    setAiPreferences(prev => ({
      ...prev,
      [preference]: value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('ai-preferences', JSON.stringify(aiPreferences))
      
      // Save to server
      await onUpdateSettings({
        ai_preferences: aiPreferences,
        smart_features: smartFeatures
      })
      
      // Show success message
      console.log('Smart settings saved successfully!')
    } catch (error) {
      console.error('Error saving smart settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const getPersonaDescription = (persona: string) => {
    const personaData = AI_PERSONAS[persona as keyof typeof AI_PERSONAS]
    return personaData ? personaData.capabilities.join(', ') : ''
  }

  return (
    <div className="space-y-6">
      {/* Smart Features Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Smart AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(smartFeatures).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Persona Settings */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            AI Persona Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Default AI Persona</label>
            <select
              value={aiPreferences.defaultPersona}
              onChange={(e) => handlePreferenceChange('defaultPersona', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {Object.entries(AI_PERSONAS).map(([key, persona]) => (
                <option key={key} value={key}>
                  {persona.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {getPersonaDescription(aiPreferences.defaultPersona)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Auto-analyze messages</span>
                </div>
                <Switch
                  checked={aiPreferences.autoAnalyze}
                  onCheckedChange={(checked) => handlePreferenceChange('autoAnalyze', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">Smart suggestions</span>
                </div>
                <Switch
                  checked={aiPreferences.smartSuggestions}
                  onCheckedChange={(checked) => handlePreferenceChange('smartSuggestions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Content moderation</span>
                </div>
                <Switch
                  checked={aiPreferences.contentModeration}
                  onCheckedChange={(checked) => handlePreferenceChange('contentModeration', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm">Sentiment analysis</span>
                </div>
                <Switch
                  checked={aiPreferences.sentimentAnalysis}
                  onCheckedChange={(checked) => handlePreferenceChange('sentimentAnalysis', checked)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  <span className="text-sm">Language translation</span>
                </div>
                <Switch
                  checked={aiPreferences.languageTranslation}
                  onCheckedChange={(checked) => handlePreferenceChange('languageTranslation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Image analysis</span>
                </div>
                <Switch
                  checked={aiPreferences.imageAnalysis}
                  onCheckedChange={(checked) => handlePreferenceChange('imageAnalysis', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm">Voice-to-text</span>
                </div>
                <Switch
                  checked={aiPreferences.voiceToText}
                  onCheckedChange={(checked) => handlePreferenceChange('voiceToText', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Smart summaries</span>
                </div>
                <Switch
                  checked={aiPreferences.smartSummaries}
                  onCheckedChange={(checked) => handlePreferenceChange('smartSummaries', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced AI Settings */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Advanced AI Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Contextual help</span>
            </div>
            <Switch
              checked={aiPreferences.contextualHelp}
              onCheckedChange={(checked) => handlePreferenceChange('contextualHelp', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Personalized responses</span>
            </div>
            <Switch
              checked={aiPreferences.personalizedResponses}
              onCheckedChange={(checked) => handlePreferenceChange('personalizedResponses', checked)}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">AI Capabilities:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Natural language processing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Sentiment analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Content moderation</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Smart suggestions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Image analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Language translation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Smart Settings'}
        </Button>
      </div>

      {/* Information Panel */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">About Smart Features</h4>
              <p className="text-xs text-muted-foreground">
                Smart features use AI to enhance your chat experience. They include sentiment analysis, 
                content moderation, smart suggestions, and more. All AI processing is done securely 
                and your privacy is protected.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>• Real-time analysis</span>
                <span>• Privacy-focused</span>
                <span>• Customizable</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
