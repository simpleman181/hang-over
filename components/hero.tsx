"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDown, Sparkles } from "lucide-react"

const greetings = [
  { text: "नमस्कार", lang: "mr" },
  { text: "Hello", lang: "en" },
  { text: "Hola", lang: "es" },
  { text: "Bonjour", lang: "fr" },
  { text: "こんにちは", lang: "ja" },
  { text: "안녕하세요", lang: "ko" },
]

export function Hero() {
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            initial={{
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        }}
      >
        {/* Animated greeting */}
        <div className="h-20 mb-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={greetingIndex}
              initial={{ y: 20, opacity: 0, rotateX: -90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: -20, opacity: 0, rotateX: 90 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl text-muted-foreground font-mono"
            >
              {greetings[greetingIndex].text}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Main title */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block">मी आहे</span>{" "}
          <motion.span
            className="inline-block text-primary relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            Creator
            <Sparkles className="absolute -top-2 -right-6 w-6 h-6 text-accent animate-pulse" />
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="block">Building fun experiments on the internet</span>
          <span className="block text-sm mt-2 opacity-70">
            इंटरनेटवर मजेदार प्रयोग तयार करत आहे
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={() => {
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="group flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:bg-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Projects
            <span className="text-sm opacity-70">प्रकल्प पहा</span>
          </motion.button>
          
          <motion.div
            className="mt-8"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <ArrowDown className="w-6 h-6 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
