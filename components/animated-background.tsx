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
      const particleCount = Math.min(30, Math.floor((canvas.width * canvas.height) / 20000))
      particlesRef.current = []

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          hue: Math.random() * 60 + 220, // Blue to purple range
        })
      }
    }

    const drawGradientBackground = () => {
      // Create the main gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)") // Purple
      gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.08)") // Indigo
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)") // Blue

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some animated gradient overlays
      const time = Date.now() * 0.0005
      
      // Moving gradient overlay 1
      const overlay1 = ctx.createRadialGradient(
        canvas.width * 0.2 + Math.sin(time) * 50,
        canvas.height * 0.2 + Math.cos(time * 0.7) * 50,
        0,
        canvas.width * 0.2 + Math.sin(time) * 50,
        canvas.height * 0.2 + Math.cos(time * 0.7) * 50,
        canvas.width * 0.3
      )
      overlay1.addColorStop(0, "rgba(139, 92, 246, 0.05)")
      overlay1.addColorStop(1, "rgba(139, 92, 246, 0)")

      ctx.fillStyle = overlay1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Moving gradient overlay 2
      const overlay2 = ctx.createRadialGradient(
        canvas.width * 0.8 + Math.sin(time * 1.2) * 40,
        canvas.height * 0.8 + Math.cos(time * 0.9) * 40,
        0,
        canvas.width * 0.8 + Math.sin(time * 1.2) * 40,
        canvas.height * 0.8 + Math.cos(time * 0.9) * 40,
        canvas.width * 0.25
      )
      overlay2.addColorStop(0, "rgba(59, 130, 246, 0.05)")
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
        particle.opacity += (Math.random() - 0.5) * 0.005
        particle.opacity = Math.max(0.05, Math.min(0.3, particle.opacity))
      })
    }

    const drawParticles = () => {
      particlesRef.current.forEach((particle) => {
        ctx.save()
        ctx.globalAlpha = particle.opacity
        
        // Create a subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        )
        gradient.addColorStop(0, `hsla(${particle.hue}, 60%, 70%, 0.4)`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 70%, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw the core particle
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 80%, 0.6)`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      drawGradientBackground()
      updateParticles()
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
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
      }}
    />
  )
}
