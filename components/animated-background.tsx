"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
}

interface RadialGradient {
  x: number
  y: number
  radius: number
  color: string
  alpha: number
  vx: number
  vy: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [gradients, setGradients] = useState<RadialGradient[]>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const createParticle = useCallback((width: number, height: number): Particle => {
    const hue = Math.random() * 360 // Random hue for varied colors
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5, // Slower movement
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 0.5, // Smaller particles
      color: `hsl(${hue}, 70%, 70%)`,
      alpha: Math.random() * 0.5 + 0.2, // More transparent
    }
  }, [])

  const createGradient = useCallback((width: number, height: number): RadialGradient => {
    const hue = Math.random() * 360
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 300 + 100, // Larger, more subtle gradients
      color: `hsl(${hue}, 80%, 60%)`,
      alpha: Math.random() * 0.1 + 0.05, // Very transparent
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
    }
  }, [])

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    setDimensions({ width, height })

    const numParticles = Math.floor((width * height) / 10000) // Scale particle count
    setParticles(Array.from({ length: numParticles }, () => createParticle(width, height)))
    setGradients(Array.from({ length: 3 }, () => createGradient(width, height))) // Few large gradients
  }, [createParticle, createGradient])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const { width, height } = dimensions

    ctx.clearRect(0, 0, width, height)

    // Update and draw gradients
    setGradients((prevGradients) =>
      prevGradients.map((g) => {
        g.x += g.vx
        g.y += g.vy

        // Bounce off edges
        if (g.x + g.radius > width || g.x - g.radius < 0) g.vx *= -1
        if (g.y + g.radius > height || g.y - g.radius < 0) g.vy *= -1

        const gradient = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.radius)
        gradient.addColorStop(0, `rgba(${parseInt(g.color.slice(4, 7))}, ${parseInt(g.color.slice(8, 11))}, ${parseInt(g.color.slice(12, 15))}, ${g.alpha})`)
        gradient.addColorStop(1, `rgba(${parseInt(g.color.slice(4, 7))}, ${parseInt(g.color.slice(8, 11))}, ${parseInt(g.color.slice(12, 15))}, 0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
        return g
      }),
    )

    // Update and draw particles
    setParticles((prevParticles) =>
      prevParticles.map((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${parseInt(p.color.slice(4, 7))}, ${parseInt(p.color.slice(8, 11))}, ${parseInt(p.color.slice(12, 15))}, ${p.alpha})`
        ctx.fill()
        return p
      }),
    )

    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i]
        const p2 = particles[j]
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

        if (distance < 100) {
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 1000})` // Faint lines
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(animate)
  }, [dimensions, particles, gradients])

  useEffect(() => {
    initCanvas()
    window.addEventListener("resize", initCanvas)

    return () => {
      window.removeEventListener("resize", initCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [initCanvas])

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      animationFrameId.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [animate, dimensions])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
      style={{
        background: "linear-gradient(to right, #8a2be2, #4169e1, #00bfff)", // Purple to Royal Blue to Deep Sky Blue
      }}
    />
  )
}
