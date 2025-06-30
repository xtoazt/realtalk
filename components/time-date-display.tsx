"use client"

import { useState, useEffect } from "react"
import { Clock, CalendarDays } from "lucide-react"

export function TimeDateDisplay() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedTime = currentDateTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const formattedDate = currentDateTime.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className="flex items-center gap-2 text-lg font-medium">
        <Clock className="h-5 w-5" />
        <span>{formattedTime}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <CalendarDays className="h-4 w-4" />
        <span>{formattedDate}</span>
      </div>
    </div>
  )
}
