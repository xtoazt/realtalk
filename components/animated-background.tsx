"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000))
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          hue: Math.random() * 60 + 240, // Blue to purple range
        })
      }
    }

    const drawGradientBackground = () => {
      // Create the main gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(168, 85, 247, 0.4)") // Purple
      gradient.addColorStop(0.3, "rgba(139, 92, 246, 0.3)") // Violet
      gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.3)") // Blue
      gradient.addColorStop(1, "rgba(37, 99, 235, 0.4)") // Darker blue

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some animated gradient overlays
      const time = Date.now() * 0.001
      
      // Moving gradient overlay 1
      const overlay1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.5) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.3) * 100,
        0,
        canvas.width * 0.3 + Math.sin(time * 0.5) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.3) * 100,
        canvas.width * 0.4
      )
      overlay1.addColorStop(0, "rgba(168, 85, 247, 0.1)")
      overlay1.addColorStop(1, "rgba(168, 85, 247, 0)")

      ctx.fillStyle = overlay1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Moving gradient overlay 2
      const overlay2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.sin(time * 0.7) * 80,
        canvas.height * 0.7 + Math.cos(time * 0.4) * 80,
        0,
        canvas.width * 0.7 + Math.sin(time * 0.7) * 80,
        canvas.height * 0.7 + Math.cos(time * 0.4) * 80,
        canvas.width * 0.3
      )
      overlay2.addColorStop(0, "rgba(59, 130, 246, 0.1)")
      overlay2.addColorStop(1, "rgba(59, 130, 246, 0)")

      ctx.fillStyle = overlay2
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Subtle opacity animation
        particle.opacity += (Math.random() - 0.5) * 0.01
        particle.opacity = Math.max(0.05, Math.min(0.4, particle.opacity))
      })
    }

    const drawParticles = () => {
      particlesRef.current.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        
        // Create a subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 70%, 0.8)`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 70%, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw the core particle
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 80%, 0.6)`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      })
    }

    const drawConnections = () => {
      const maxDistance = 150
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i]
          const p2 = particlesRef.current[j]
          
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.1
            
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.strokeStyle = `hsla(250, 60%, 70%, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      drawGradientBackground()
      updateParticles()
      drawConnections()
      drawParticles()
      
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createParticles()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
      }}
    />
  )
}
