"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ArcheryGameProps {
  isOpen: boolean
  onClose: () => void
}

const CANVAS_WIDTH = 350
const CANVAS_HEIGHT = 400
const TARGET_X = CANVAS_WIDTH - 60
const ARROW_START_X = 50

export function ArcheryGame({ isOpen, onClose }: ArcheryGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [arrows, setArrows] = useState(5)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [power, setPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [lastHit, setLastHit] = useState<string | null>(null)

  const gameStateRef = useRef({
    targetY: CANVAS_HEIGHT / 2,
    targetDirection: 1,
    targetSpeed: 2,
    arrowY: CANVAS_HEIGHT / 2,
    arrowX: ARROW_START_X,
    arrowFlying: false,
    arrowSpeed: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("archeryHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const getScoreForHit = (arrowY: number, targetY: number): { points: number; zone: string } => {
    const distance = Math.abs(arrowY - targetY)
    if (distance < 10) return { points: 100, zone: "BULLSEYE! / सटीक!" }
    if (distance < 25) return { points: 50, zone: "Great! / उत्तम!" }
    if (distance < 40) return { points: 25, zone: "Good! / चांगले!" }
    if (distance < 55) return { points: 10, zone: "OK / ठीक" }
    return { points: 0, zone: "Miss / चुकले" }
  }

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Move target
    state.targetY += state.targetSpeed * state.targetDirection
    if (state.targetY <= 60 || state.targetY >= CANVAS_HEIGHT - 60) {
      state.targetDirection *= -1
    }

    // Move arrow if flying
    if (state.arrowFlying) {
      state.arrowX += state.arrowSpeed
      
      // Check if arrow hit target area
      if (state.arrowX >= TARGET_X - 30) {
        state.arrowFlying = false
        const { points, zone } = getScoreForHit(state.arrowY, state.targetY)
        setScore((prev) => prev + points)
        setLastHit(zone)
        setArrows((prev) => prev - 1)
        
        // Reset arrow position after delay
        setTimeout(() => {
          state.arrowX = ARROW_START_X
          setLastHit(null)
        }, 800)
      }
    }

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grass
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30)

    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - 30)
    gradient.addColorStop(0, "#1e3a5f")
    gradient.addColorStop(1, "#2d5a7b")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - 30)

    // Draw target
    const targetRings = [
      { radius: 50, color: "#ffffff" },
      { radius: 40, color: "#000000" },
      { radius: 30, color: "#3b82f6" },
      { radius: 20, color: "#ef4444" },
      { radius: 10, color: "#fbbf24" },
    ]

    targetRings.forEach(({ radius, color }) => {
      ctx.beginPath()
      ctx.arc(TARGET_X, state.targetY, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = "#00000033"
      ctx.stroke()
    })

    // Draw bow
    ctx.strokeStyle = "#8B4513"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(30, state.arrowY, 40, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()

    // Draw bow string
    ctx.strokeStyle = "#d4a373"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(30, state.arrowY - 40)
    ctx.lineTo(isCharging ? 30 - power / 3 : 30, state.arrowY)
    ctx.lineTo(30, state.arrowY + 40)
    ctx.stroke()

    // Draw arrow
    if (!state.arrowFlying || state.arrowX < TARGET_X - 30) {
      const arrowX = state.arrowFlying ? state.arrowX : (isCharging ? 30 - power / 3 : ARROW_START_X)
      const arrowY = state.arrowY

      // Arrow shaft
      ctx.strokeStyle = "#8B4513"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(arrowX + 40, arrowY)
      ctx.stroke()

      // Arrow head
      ctx.fillStyle = "#71717a"
      ctx.beginPath()
      ctx.moveTo(arrowX + 40, arrowY - 6)
      ctx.lineTo(arrowX + 55, arrowY)
      ctx.lineTo(arrowX + 40, arrowY + 6)
      ctx.closePath()
      ctx.fill()

      // Arrow feathers
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY - 5)
      ctx.lineTo(arrowX + 10, arrowY)
      ctx.lineTo(arrowX, arrowY + 5)
      ctx.closePath()
      ctx.fill()
    }

    // Draw power meter
    if (isCharging) {
      ctx.fillStyle = "#00000066"
      ctx.fillRect(10, 10, 104, 24)
      const powerColor = power < 40 ? "#22c55e" : power < 70 ? "#eab308" : "#ef4444"
      ctx.fillStyle = powerColor
      ctx.fillRect(12, 12, power, 20)
    }
  }, [isCharging, power])

  const startCharging = () => {
    if (gameOver || arrows <= 0 || gameStateRef.current.arrowFlying) return
    setIsCharging(true)
    setPower(0)
  }

  const releaseArrow = () => {
    if (!isCharging || gameStateRef.current.arrowFlying) return
    
    setIsCharging(false)
    gameStateRef.current.arrowFlying = true
    gameStateRef.current.arrowSpeed = 5 + power / 10
    gameStateRef.current.arrowX = ARROW_START_X
  }

  useEffect(() => {
    if (!isCharging) return
    
    const interval = setInterval(() => {
      setPower((prev) => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 20)

    return () => clearInterval(interval)
  }, [isCharging])

  useEffect(() => {
    if (arrows <= 0 && gameStarted && !gameStateRef.current.arrowFlying) {
      setTimeout(() => {
        setGameOver(true)
        if (score > highScore) {
          setHighScore(score)
          if (typeof window !== "undefined") {
            localStorage.setItem("archeryHighScore", String(score))
          }
        }
      }, 1000)
    }
  }, [arrows, gameStarted, score, highScore])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        if (!isCharging) {
          startCharging()
        }
      } else if (e.key === "ArrowUp") {
        gameStateRef.current.arrowY = Math.max(60, gameStateRef.current.arrowY - 10)
      } else if (e.key === "ArrowDown") {
        gameStateRef.current.arrowY = Math.min(CANVAS_HEIGHT - 60, gameStateRef.current.arrowY + 10)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isCharging) {
        releaseArrow()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    const intervalId = setInterval(gameLoop, 1000 / 60)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      clearInterval(intervalId)
    }
  }, [isOpen, gameStarted, gameOver, gameLoop, isCharging])

  const handleCanvasTouch = (e: React.TouchEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const touch = e.touches[0]
    const y = ((touch.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    gameStateRef.current.arrowY = Math.max(60, Math.min(CANVAS_HEIGHT - 60, y))
  }

  const startGame = () => {
    gameStateRef.current = {
      targetY: CANVAS_HEIGHT / 2,
      targetDirection: 1,
      targetSpeed: 2,
      arrowY: CANVAS_HEIGHT / 2,
      arrowX: ARROW_START_X,
      arrowFlying: false,
      arrowSpeed: 0,
    }
    setScore(0)
    setArrows(5)
    setGameOver(false)
    setLastHit(null)
    setGameStarted(true)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Archery / धनुर्विद्या</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏹</div>
              <h3 className="text-xl font-bold mb-2">Archery / धनुर्विद्या</h3>
              <p className="text-muted-foreground mb-2">
                Hit the bullseye for maximum points!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                जास्तीत जास्त गुणांसाठी मध्यबिंदू मारा!
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Hold Space to charge, release to shoot
                <br />
                चार्ज करण्यासाठी स्पेस धरा, शूट करण्यासाठी सोडा
              </p>
              {highScore > 0 && (
                <p className="text-sm text-primary mb-4">High Score: {highScore}</p>
              )}
              <Button onClick={startGame} size="lg" type="button">
                <Play className="w-5 h-5 mr-2" />
                Start Game / खेळ सुरू करा
              </Button>
            </div>
          ) : gameOver ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl sm:text-5xl font-bold text-destructive mb-4"
              >
                खेळ खल्लास !
                <br />
                GAME OVER
              </motion.div>
              <p className="text-2xl font-bold mb-2">Score: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="text-primary font-bold mb-4">New High Score! / नवीन उच्च गुण!</p>
              )}
              <Button onClick={startGame} type="button">
                Play Again / पुन्हा खेळा
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between w-full text-sm">
                <span>Score: {score}</span>
                <span>Arrows: {arrows}</span>
              </div>
              
              {lastHit && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-lg font-bold text-primary"
                >
                  {lastHit}
                </motion.div>
              )}
              
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg border border-border cursor-crosshair"
                onMouseDown={startCharging}
                onMouseUp={releaseArrow}
                onTouchStart={(e) => {
                  handleCanvasTouch(e)
                  startCharging()
                }}
                onTouchMove={handleCanvasTouch}
                onTouchEnd={releaseArrow}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Arrow keys to aim, hold Space to charge / बाण की ने लक्ष्य करा, स्पेस धरून चार्ज करा
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
