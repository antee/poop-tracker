import { useEffect, useRef } from 'react'

interface ConfettiParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  opacity: number
}

interface ConfettiProps {
  trigger: number
  buttonRect: DOMRect | null
  onComplete?: () => void
}

const GRAVITY = 0.5
const DURATION = 3000 // 3 seconds
const PARTICLE_COUNT = 50

export function Confetti({ trigger, buttonRect, onComplete }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<ConfettiParticle[]>([])
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    if (!trigger || !buttonRect || !containerRef.current) return

    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Create particles
    const particles: ConfettiParticle[] = []
    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random direction with upward bias
      const angle = (Math.random() - 0.5) * Math.PI * 0.8 // ±72 degrees from vertical
      const speed = 16 + Math.random() * 24 // 16-40 initial speed (doubled)
      
      particles.push({
        id: i,
        x: centerX + (Math.random() - 0.5) * 20, // Small spread from center
        y: centerY,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed, // Negative for upward
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10, // -5 to +5 degrees per frame
        size: 1 + Math.random() * 2, // 1x to 3x size
        opacity: 1
      })
    }

    particlesRef.current = particles
    startTimeRef.current = Date.now()

    // Animation loop
    const animate = () => {
      const now = Date.now()
      const elapsed = now - (startTimeRef.current || 0)
      const progress = elapsed / DURATION

      if (progress >= 1) {
        // Animation complete
        if (onComplete) onComplete()
        return
      }

      // Update particles
      particlesRef.current.forEach(particle => {
        // Apply gravity
        particle.vy += GRAVITY
        
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Update rotation
        particle.rotation += particle.rotationSpeed
        
        // Fade out in the last 20% of animation
        if (progress > 0.8) {
          particle.opacity = 1 - ((progress - 0.8) / 0.2)
        }
      })

      // Render particles
      if (containerRef.current) {
        containerRef.current.innerHTML = particlesRef.current
          .map(particle => `
            <div style="
              position: fixed;
              left: ${particle.x}px;
              top: ${particle.y}px;
              transform: rotate(${particle.rotation}deg);
              font-size: ${particle.size}em;
              opacity: ${particle.opacity};
              pointer-events: none;
              z-index: 1000;
            ">💩</div>
          `).join('')
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [trigger, buttonRect, onComplete])

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ zIndex: 1000 }}
    />
  )
}
