"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PingPongProps {
  isOpen: boolean
  onClose: () => void
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 300
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 60
const BALL_SIZE = 10
const PADDLE_SPEED = 8
const INITIAL_BALL_SPEED = 4
const WINNING_SCORE = 5

export function PingPong({ isOpen, onClose }: PingPongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player" | "ai" | null>(null)

  const gameStateRef = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballSpeedX: INITIAL_BALL_SPEED,
    ballSpeedY: INITIAL_BALL_SPEED,
    keysPressed: {} as Record<string, boolean>,
  })

  const resetBall = useCallback((direction: number) => {
    const state = gameStateRef.current
    state.ballX = CANVAS_WIDTH / 2
    state.ballY = CANVAS_HEIGHT / 2
    state.ballSpeedX = INITIAL_BALL_SPEED * direction
    state.ballSpeedY = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Player movement
    if (state.keysPressed["ArrowUp"] || state.keysPressed["w"]) {
      state.playerY = Math.max(0, state.playerY - PADDLE_SPEED)
    }
    if (state.keysPressed["ArrowDown"] || state.keysPressed["s"]) {
      state.playerY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.playerY + PADDLE_SPEED)
    }

    // AI movement
    const aiCenter = state.aiY + PADDLE_HEIGHT / 2
    const aiSpeed = 3
    if (aiCenter < state.ballY - 20) {
      state.aiY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.aiY + aiSpeed)
    } else if (aiCenter > state.ballY + 20) {
      state.aiY = Math.max(0, state.aiY - aiSpeed)
    }

    // Ball movement
    state.ballX += state.ballSpeedX
    state.ballY += state.ballSpeedY

    // Ball collision with top/bottom walls
    if (state.ballY <= 0 || state.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
      state.ballSpeedY = -state.ballSpeedY
    }

    // Ball collision with player paddle
    if (
      state.ballX <= PADDLE_WIDTH + 10 &&
      state.ballY + BALL_SIZE >= state.playerY &&
      state.ballY <= state.playerY + PADDLE_HEIGHT
    ) {
      state.ballSpeedX = Math.abs(state.ballSpeedX) * 1.05
      const hitPos = (state.ballY - state.playerY) / PADDLE_HEIGHT
      state.ballSpeedY = (hitPos - 0.5) * 8
    }

    // Ball collision with AI paddle
    if (
      state.ballX >= CANVAS_WIDTH - PADDLE_WIDTH - 10 - BALL_SIZE &&
      state.ballY + BALL_SIZE >= state.aiY &&
      state.ballY <= state.aiY + PADDLE_HEIGHT
    ) {
      state.ballSpeedX = -Math.abs(state.ballSpeedX) * 1.05
      const hitPos = (state.ballY - state.aiY) / PADDLE_HEIGHT
      state.ballSpeedY = (hitPos - 0.5) * 8
    }

    // Scoring
    if (state.ballX <= 0) {
      setAiScore((prev) => {
        const newScore = prev + 1
        if (newScore >= WINNING_SCORE) {
          setGameOver(true)
          setWinner("ai")
        } else {
          resetBall(-1)
        }
        return newScore
      })
    }

    if (state.ballX >= CANVAS_WIDTH) {
      setPlayerScore((prev) => {
        const newScore = prev + 1
        if (newScore >= WINNING_SCORE) {
          setGameOver(true)
          setWinner("player")
        } else {
          resetBall(1)
        }
        return newScore
      })
    }

    // Draw
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw center line
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = "#4a5568"
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw paddles
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT)

    ctx.fillStyle = "#ef4444"
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, state.aiY, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Draw ball
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(state.ballX + BALL_SIZE / 2, state.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()
  }, [resetBall])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
        e.preventDefault()
        gameStateRef.current.keysPressed[e.key] = true
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed[e.key] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const intervalId = setInterval(gameLoop, 1000 / 60)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      clearInterval(intervalId)
    }
  }, [isOpen, gameStarted, gameOver, gameLoop])

  const startGame = () => {
    setPlayerScore(0)
    setAiScore(0)
    setGameOver(false)
    setWinner(null)
    gameStateRef.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      aiY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED,
      ballSpeedY: INITIAL_BALL_SPEED,
      keysPressed: {},
    }
    setGameStarted(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const y = ((touch.clientY - rect.top) / rect.height) * CANVAS_HEIGHT
    gameStateRef.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y - PADDLE_HEIGHT / 2))
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
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Ping Pong / पिंग पॉंग</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏓</div>
              <h3 className="text-xl font-bold mb-2">Ping Pong / पिंग पॉंग</h3>
              <p className="text-muted-foreground mb-2">
                First to {WINNING_SCORE} points wins!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {WINNING_SCORE} गुण मिळवणारा प्रथम जिंकतो!
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Arrow Up/Down or W/S to move paddle
                <br />
                पॅडल हलवण्यासाठी ॲरो अप/डाउन किंवा W/S
              </p>
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
              <div className="text-6xl mb-4">{winner === "player" ? "🏆" : "😢"}</div>
              <p className="text-2xl font-bold mb-2">
                {winner === "player" ? "You Win! / तुम्ही जिंकलात!" : "AI Wins! / AI जिंकला!"}
              </p>
              <p className="text-muted-foreground mb-4">
                Final Score: {playerScore} - {aiScore}
              </p>
              <Button onClick={startGame} type="button">
                Play Again / पुन्हा खेळा
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-between w-full max-w-[400px] text-xl font-bold">
                <span className="text-green-500">You: {playerScore}</span>
                <span className="text-red-500">AI: {aiScore}</span>
              </div>
              
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg border border-border max-w-full"
                style={{ touchAction: "none" }}
                onTouchMove={handleTouchMove}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Use Arrow keys or W/S to move | Touch to control on mobile
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
