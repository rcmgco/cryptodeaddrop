import React, { useState, useEffect } from 'react'
import { getPlatformStats, PlatformStats } from '@/services/messageService'

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalEncrypted: 0,
    totalDecrypted: 0,
    successRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const platformStats = await getPlatformStats()
      setStats(platformStats)
    } catch (error) {
      console.error('Failed to load platform stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground text-center">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 text-center shadow">
              <div className="text-3xl font-bold text-muted-foreground animate-pulse">---</div>
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground text-center">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center shadow hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-primary">{stats.totalEncrypted.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Encrypted Messages</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center shadow hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-accent">{stats.totalDecrypted.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Decrypted Messages</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 text-center shadow hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-secondary">{stats.successRate}%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
      </div>
    </section>
  )
}