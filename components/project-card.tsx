"use client"

import React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ExternalLink, Play } from "lucide-react"

interface ProjectCardProps {
  title: string
  titleMarathi: string
  description: string
  descriptionMarathi: string
  color: string
  icon: React.ReactNode
  href?: string
  interactive?: boolean
  onInteract?: () => void
}

export function ProjectCard({
  title,
  titleMarathi,
  description,
  descriptionMarathi,
  color,
  icon,
  href,
  interactive = false,
  onInteract,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={interactive ? onInteract : undefined}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 h-full min-h-[280px] flex flex-col"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${color}20 0%, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <motion.div
          className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: `${color}20` }}
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div style={{ color }}>{icon}</div>
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <h3 className="text-xl font-bold text-card-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 font-mono">{titleMarathi}</p>
          <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
          <p className="text-muted-foreground/60 text-xs mt-1 font-mono">{descriptionMarathi}</p>
        </div>

        {/* Action indicator */}
        <motion.div
          className="relative z-10 mt-4 flex items-center gap-2 text-sm font-medium"
          style={{ color }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
        >
          {interactive ? (
            <>
              <Play className="w-4 h-4" />
              <span>Play Now / आता खेळा</span>
            </>
          ) : href ? (
            <>
              <ExternalLink className="w-4 h-4" />
              <span>View Project / प्रकल्प पहा</span>
            </>
          ) : null}
        </motion.div>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
            transform: "translateX(-100%)",
          }}
          animate={{
            transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
          }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </motion.div>
  )
}
