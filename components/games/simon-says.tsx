"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimonSaysProps {
  isOpen: boolean
  onClose: () => void
}

type Color = "red" | "green" | "blue" | "yellow"

const COLORS: Color[] = ["red", "green", "blue", "yellow"]

const COLOR_CONFIG = {
  red: { bg: "bg-red-500", active: "bg-red-300", position: "rounded-tl-full" },
  green: { bg: "bg-green-500", active: "bg-green-300", position: "rounded-tr-full" },
  blue: { bg: "bg-blue-500", active: "bg-blue-300", position: "rounded-bl-full" },
  yellow: { bg: "bg-yellow-500", active: "bg-yellow-300", position: "rounded-br-full" },
}

export function SimonSays({ isOpen, onClose }: SimonSaysProps) {
  const [sequence, setSequence] = useState<Color[]>([])
  const [playerSequence, setPlayerSequence] = useState<Color[]>([])
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [gameStatus, setGameStatus] = useState<"idle" | "showing" | "playing" | "gameover">("idle")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("simonHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("simonHighScore", String(score))
    }
  }, [score, highScore])

  const playSound = useCallback((color: Color) => {
    if (typeof window === "undefined") return
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    
    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    const frequencies: Record<Color, number> = {
      red: 329.63,    // E4
      green: 261.63,  // C4
      blue: 220.00,   // A3
      yellow: 164.81, // E3
    }
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = frequencies[color]
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }, [])

  const flashColor = useCallback((color: Color) => {
    return new Promise<void>(resolve => {
      setActiveColor(color)
      playSound(color)
      setTimeout(() => {
        setActiveColor(null)
        setTimeout(resolve, 200)
      }, 400)
    })
  }, [playSound])

  const showSequence = useCallback(async () => {
    setGameStatus("showing")
    await new Promise(resolve => setTimeout(resolve, 500))
    
    for (const color of sequence) {
      await flashColor(color)
    }
    
    setGameStatus("playing")
    setPlayerSequence([])
  }, [sequence, flashColor])

  const addToSequence = useCallback(() => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    setSequence(prev => [...prev, newColor])
  }, [])

  useEffect(() => {
    if (sequence.length > 0 && gameStatus !== "gameover") {
      showSequence()
    }
  }, [sequence])

  const startGame = () => {
    setSequence([])
    setPlayerSequence([])
    setScore(0)
    setGameStatus("idle")
    // Start with first color
    setTimeout(() => {
      const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)]
      setSequence([firstColor])
    }, 500)
  }

  const handleColorClick = async (color: Color) => {
    if (gameStatus !== "playing") return
    
    await flashColor(color)
    
    const newPlayerSequence = [...playerSequence, color]
    setPlayerSequence(newPlayerSequence)
    
    const currentIndex = newPlayerSequence.length - 1
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Wrong color - game over
      setGameStatus("gameover")
      return
    }
    
    if (newPlayerSequence.length === sequence.length) {
      // Completed sequence
      setScore(s => s + 1)
      setPlayerSequence([])
      
      // Add next color after delay
      setTimeout(() => {
        addToSequence()
      }, 1000)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Simon Says</h2>
              <p className="text-sm text-muted-foreground">सायमन म्हणतो - क्रम लक्षात ठेवा!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">Score / गुण</div>
              <div className="text-3xl font-bold text-primary">{score}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">Best / सर्वोत्तम</div>
              <div className="text-3xl font-bold text-accent">{highScore}</div>
            </div>
          </div>

          {/* Game status */}
          <div className="text-center mb-4">
            {gameStatus === "idle" && (
              <p className="text-muted-foreground">Press Start to begin! / सुरू करण्यासाठी दाबा!</p>
            )}
            {gameStatus === "showing" && (
              <p className="text-primary font-medium">Watch the sequence... / क्रम पहा...</p>
            )}
            {gameStatus === "playing" && (
              <p className="text-green-600 font-medium">Your turn! / तुमची पाळी!</p>
            )}
            {gameStatus === "gameover" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <p className="text-red-600 font-bold text-lg">Game Over!</p>
                <p className="text-sm text-accent">खेळ खल्लास ! GAME OVER</p>
              </motion.div>
            )}
          </div>

          {/* Simon board */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <div className="absolute inset-0 grid grid-cols-2 gap-2">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  className={`${COLOR_CONFIG[color].position} ${
                    activeColor === color ? COLOR_CONFIG[color].active : COLOR_CONFIG[color].bg
                  } transition-colors`}
                  onClick={() => handleColorClick(color)}
                  disabled={gameStatus !== "playing"}
                  whileHover={{ scale: gameStatus === "playing" ? 1.02 : 1 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    opacity: activeColor === color ? 1 : 0.7,
                    boxShadow: activeColor === color ? "0 0 30px rgba(255,255,255,0.5)" : "none",
                  }}
                />
              ))}
            </div>
            
            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-card border-4 border-border flex items-center justify-center">
                <span className="text-2xl font-bold text-card-foreground">{sequence.length}</span>
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          {gameStatus === "playing" && (
            <div className="flex justify-center gap-1 mb-4">
              {sequence.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < playerSequence.length ? "bg-green-500" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Controls */}
          <Button
            onClick={startGame}
            className="w-full"
            disabled={gameStatus === "showing"}
          >
            {gameStatus === "idle" ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Game / खेळ सुरू करा
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart / पुन्हा सुरू करा
              </>
            )}
          </Button>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Watch the colors light up, then repeat the sequence!
            <br />
            रंग प्रकाशित होताना पहा, मग क्रम पुन्हा करा!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
