"use client"

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: string[]
  type: 'major' | 'minor' | 'patch'
  important: boolean
}

export interface ChangelogData {
  latest: string
  versions: Record<string, ChangelogEntry>
}

class ChangelogService {
  private static instance: ChangelogService
  private changelogData: ChangelogData | null = null
  private readonly STORAGE_KEY = 'realtalk_last_seen_version'

  public static getInstance(): ChangelogService {
    if (!ChangelogService.instance) {
      ChangelogService.instance = new ChangelogService()
    }
    return ChangelogService.instance
  }

  private constructor() {
    this.loadChangelog()
  }

  private async loadChangelog(): Promise<void> {
    try {
      // Only fetch on the client side
      if (typeof window === 'undefined') {
        return
      }
      
      const response = await fetch('/changelog.json')
      if (response.ok) {
        this.changelogData = await response.json()
      } else {
        console.warn('Failed to load changelog data')
      }
    } catch (error) {
      console.error('Error loading changelog:', error)
    }
  }

  public async getChangelog(): Promise<ChangelogData | null> {
    if (!this.changelogData) {
      await this.loadChangelog()
    }
    return this.changelogData
  }

  public async getLatestVersion(): Promise<string | null> {
    const changelog = await this.getChangelog()
    return changelog?.latest || null
  }

  public async getAllVersions(): Promise<ChangelogEntry[]> {
    const changelog = await this.getChangelog()
    if (!changelog) return []

    return Object.values(changelog.versions)
      .sort((a, b) => this.compareVersions(b.version, a.version))
  }

  public async getVersionInfo(version: string): Promise<ChangelogEntry | null> {
    const changelog = await this.getChangelog()
    return changelog?.versions[version] || null
  }

  public getLastSeenVersion(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.STORAGE_KEY)
  }

  public setLastSeenVersion(version: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, version)
  }

  public async hasNewVersion(): Promise<boolean> {
    const latestVersion = await this.getLatestVersion()
    const lastSeenVersion = this.getLastSeenVersion()
    
    if (!latestVersion || !lastSeenVersion) {
      return !!latestVersion
    }

    return this.compareVersions(latestVersion, lastSeenVersion) > 0
  }

  public async getNewVersionInfo(): Promise<ChangelogEntry | null> {
    const hasNew = await this.hasNewVersion()
    if (!hasNew) return null

    const latestVersion = await this.getLatestVersion()
    if (!latestVersion) return null

    return this.getVersionInfo(latestVersion)
  }

  public markVersionAsSeen(version?: string): void {
    if (version) {
      this.setLastSeenVersion(version)
    } else {
      this.getLatestVersion().then(latest => {
        if (latest) {
          this.setLastSeenVersion(latest)
        }
      })
    }
  }

  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(n => parseInt(n, 10))
    const v2parts = version2.split('.').map(n => parseInt(n, 10))
    
    const maxLength = Math.max(v1parts.length, v2parts.length)
    
    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0
      const v2part = v2parts[i] || 0
      
      if (v1part > v2part) return 1
      if (v1part < v2part) return -1
    }
    
    return 0
  }

  public formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  public getVersionBadgeColor(type: string): string {
    switch (type) {
      case 'major':
        return 'bg-red-500 text-white'
      case 'minor':
        return 'bg-blue-500 text-white'
      case 'patch':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }
}

export const changelogService = ChangelogService.getInstance()