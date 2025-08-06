'use client'

import { useEffect, useRef } from 'react'

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
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
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
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() * 60 + 240, // Blue to purple range
        })
      }
    }

    const drawGradientBackground = () => {
      // Create the main gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#8B5CF6') // Purple
      gradient.addColorStop(0.5, '#3B82F6') // Blue
      gradient.addColorStop(1, '#06B6D4') // Cyan

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some moving radial gradients for depth
      const time = Date.now() * 0.001
      
      // First moving gradient
      const radialGradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time * 0.5) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.3) * 100,
        0,
        canvas.width * 0.3 + Math.sin(time * 0.5) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.3) * 100,
        300
      )
      radialGradient1.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
      radialGradient1.addColorStop(1, 'rgba(139, 92, 246, 0)')

      ctx.fillStyle = radialGradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Second moving gradient
      const radialGradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.sin(time * 0.7) * 80,
        canvas.height * 0.7 + Math.cos(time * 0.4) * 80,
        0,
        canvas.width * 0.7 + Math.sin(time * 0.7) * 80,
        canvas.height * 0.7 + Math.cos(time * 0.4) * 80,
        250
      )
      radialGradient2.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
      radialGradient2.addColorStop(1, 'rgba(59, 130, 246, 0)')

      ctx.fillStyle = radialGradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const updateParticles = () => {
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Subtle opacity animation
        particle.opacity += (Math.random() - 0.5) * 0.02
        particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity))
      })
    }

    const drawParticles = () => {
      particlesRef.current.forEach(particle => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`
        ctx.fill()

        // Add a subtle glow
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 70%, ${particle.opacity * 0.2})`
        ctx.fill()
      })
    }

    const drawConnections = () => {
      const maxDistance = 150
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.3
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })
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

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%)' }}
    />
  )
}
