"use client"

import { useEffect, useState } from "react"

export function BatteryStatus() {
  const [level, setLevel] = useState<number | null>(null)
  const [charging, setCharging] = useState<boolean | null>(null)

  useEffect(() => {
    let battery: any
    const init = async () => {
      try {
        // @ts-ignore navigator.getBattery is not standard in TS lib
        const batt = await (navigator as any).getBattery?.()
        if (!batt) return
        battery = batt
        const update = () => {
          setLevel(Math.round(battery.level * 100))
          setCharging(Boolean(battery.charging))
        }
        update()
        battery.addEventListener('levelchange', update)
        battery.addEventListener('chargingchange', update)
      } catch {}
    }
    init()
    return () => {
      try {
        if (battery) {
          battery.removeEventListener('levelchange', () => {})
          battery.removeEventListener('chargingchange', () => {})
        }
      } catch {}
    }
  }, [])

  if (level === null) return null
  return (
    <div className="text-sm text-muted-foreground">
      Battery: {level}% {charging ? '⚡' : ''}
    </div>
  )
}


