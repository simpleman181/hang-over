"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Zap, RotateCcw } from "lucide-react"

interface ReactionGameProps {
  isOpen: boolean
  onClose: () => void
}

type GameState = "waiting" | "ready" | "go" | "clicked" | "too-early"

export function ReactionGame({ isOpen, onClose }: ReactionGameProps) {
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const startTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("reactionBestTime")
      if (saved) setBestTime(Number(saved))
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isOpen])

  const startGame = () => {
    setGameState("ready")
    setReactionTime(null)
    
    const delay = 1000 + Math.random() * 4000
    timeoutRef.current = setTimeout(() => {
      setGameState("go")
      startTimeRef.current = Date.now()
    }, delay)
  }

  const handleClick = () => {
    if (gameState === "waiting") {
      startGame()
    } else if (gameState === "ready") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setGameState("too-early")
    } else if (gameState === "go") {
      const time = Date.now() - startTimeRef.current
      setReactionTime(time)
      setAttempts((prev) => [...prev.slice(-4), time])
      setGameState("clicked")
      
      if (!bestTime || time < bestTime) {
        setBestTime(time)
        localStorage.setItem("reactionBestTime", String(time))
      }
    } else if (gameState === "too-early" || gameState === "clicked") {
      startGame()
    }
  }

  const getAverageTime = () => {
    if (attempts.length === 0) return null
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
  }

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting": return "bg-primary"
      case "ready": return "bg-destructive"
      case "go": return "bg-game"
      case "clicked": return "bg-primary"
      case "too-early": return "bg-destructive"
    }
  }

  const getMessage = () => {
    switch (gameState) {
      case "waiting":
        return { title: "Click to Start", subtitle: "सुरू करण्यासाठी क्लिक करा" }
      case "ready":
        return { title: "Wait for Green...", subtitle: "हिरव्या रंगाची वाट पहा..." }
      case "go":
        return { title: "CLICK NOW!", subtitle: "आता क्लिक करा!" }
      case "clicked":
        return { 
          title: `${reactionTime}ms`, 
          subtitle: reactionTime && reactionTime < 250 
            ? "Amazing! / अप्रतिम!" 
            : reactionTime && reactionTime < 350 
            ? "Good! / छान!" 
            : "Try again! / पुन्हा प्रयत्न करा!" 
        }
      case "too-early":
        return { title: "Too Early!", subtitle: "खूप लवकर! पुन्हा प्रयत्न करा" }
    }
  }

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setGameState("waiting")
    setReactionTime(null)
    setAttempts([])
  }

  if (!isOpen) return null

  const message = getMessage()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Daily Wonder</h2>
              <p className="text-sm text-muted-foreground font-mono">दैनिक आश्चर्य</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-card-foreground">
                {bestTime ? `${bestTime}ms` : "---"}
              </p>
              <p className="text-xs text-muted-foreground">Best / सर्वोत्तम</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-card-foreground">
                {getAverageTime() ? `${getAverageTime()}ms` : "---"}
              </p>
              <p className="text-xs text-muted-foreground">Average / सरासरी</p>
            </div>
          </div>

          {/* Game area */}
          <motion.button
            type="button"
            onClick={handleClick}
            className={`w-full h-48 rounded-2xl flex flex-col items-center justify-center transition-colors ${getBackgroundColor()}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap className="w-12 h-12 text-primary-foreground mb-4" />
            <h3 className="text-2xl font-bold text-primary-foreground">{message.title}</h3>
            <p className="text-sm text-primary-foreground/80 mt-1">{message.subtitle}</p>
          </motion.button>

          {/* Attempts history */}
          {attempts.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2 text-center">
                Recent attempts / अलीकडील प्रयत्न
              </p>
              <div className="flex justify-center gap-2">
                {attempts.map((time, i) => (
                  <div
                    key={i}
                    className="px-3 py-1 bg-muted rounded-full text-xs font-mono text-muted-foreground"
                  >
                    {time}ms
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="flex justify-center mt-6">
            <motion.button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset Stats / आकडेवारी रीसेट करा
            </motion.button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Test your reaction speed! / तुमचा प्रतिक्रिया वेग तपासा!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
