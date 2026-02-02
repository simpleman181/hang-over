"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FlappyBirdProps {
  isOpen: boolean
  onClose: () => void
}

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 480
const BIRD_SIZE = 30
const PIPE_WIDTH = 50
const PIPE_GAP = 150
const GRAVITY = 0.5
const JUMP_STRENGTH = -8
const PIPE_SPEED = 3

interface Pipe {
  x: number
  topHeight: number
  passed: boolean
}

export function FlappyBird({ isOpen, onClose }: FlappyBirdProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const gameStateRef = useRef({
    birdY: CANVAS_HEIGHT / 2,
    birdVelocity: 0,
    pipes: [] as Pipe[],
    frameCount: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("flappyHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const jump = useCallback(() => {
    if (!gameStarted || gameOver) return
    gameStateRef.current.birdVelocity = JUMP_STRENGTH
  }, [gameStarted, gameOver])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Update bird
    state.birdVelocity += GRAVITY
    state.birdY += state.birdVelocity

    // Generate pipes
    state.frameCount++
    if (state.frameCount % 100 === 0) {
      const topHeight = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50
      state.pipes.push({ x: CANVAS_WIDTH, topHeight, passed: false })
    }

    // Update pipes
    state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH)
    state.pipes.forEach((pipe) => {
      pipe.x -= PIPE_SPEED

      // Check for scoring
      if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
        pipe.passed = true
        setScore((prev) => prev + 1)
      }
    })

    // Collision detection
    const birdLeft = 50
    const birdRight = 50 + BIRD_SIZE
    const birdTop = state.birdY
    const birdBottom = state.birdY + BIRD_SIZE

    // Ground/ceiling collision
    if (birdTop <= 0 || birdBottom >= CANVAS_HEIGHT) {
      setGameOver(true)
      return
    }

    // Pipe collision
    for (const pipe of state.pipes) {
      const pipeLeft = pipe.x
      const pipeRight = pipe.x + PIPE_WIDTH

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          setGameOver(true)
          return
        }
      }
    }

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, "#87CEEB")
    gradient.addColorStop(1, "#E0F6FF")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw pipes
    state.pipes.forEach((pipe) => {
      // Top pipe
      ctx.fillStyle = "#22c55e"
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight)
      ctx.fillStyle = "#16a34a"
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 20, PIPE_WIDTH + 6, 20)

      // Bottom pipe
      const bottomPipeY = pipe.topHeight + PIPE_GAP
      ctx.fillStyle = "#22c55e"
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeY)
      ctx.fillStyle = "#16a34a"
      ctx.fillRect(pipe.x - 3, bottomPipeY, PIPE_WIDTH + 6, 20)
    })

    // Draw ground
    ctx.fillStyle = "#8B4513"
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20)
    ctx.fillStyle = "#228B22"
    ctx.fillRect(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 5)

    // Draw bird
    ctx.fillStyle = "#fbbf24"
    ctx.beginPath()
    ctx.ellipse(50 + BIRD_SIZE / 2, state.birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bird eye
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(50 + BIRD_SIZE / 2 + 8, state.birdY + BIRD_SIZE / 2 - 3, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#000000"
    ctx.beginPath()
    ctx.arc(50 + BIRD_SIZE / 2 + 10, state.birdY + BIRD_SIZE / 2 - 3, 3, 0, Math.PI * 2)
    ctx.fill()

    // Bird beak
    ctx.fillStyle = "#f97316"
    ctx.beginPath()
    ctx.moveTo(50 + BIRD_SIZE, state.birdY + BIRD_SIZE / 2)
    ctx.lineTo(50 + BIRD_SIZE + 10, state.birdY + BIRD_SIZE / 2 + 3)
    ctx.lineTo(50 + BIRD_SIZE, state.birdY + BIRD_SIZE / 2 + 6)
    ctx.closePath()
    ctx.fill()

    // Bird wing
    ctx.fillStyle = "#f59e0b"
    ctx.beginPath()
    ctx.ellipse(50 + BIRD_SIZE / 2 - 5, state.birdY + BIRD_SIZE / 2 + 5, 8, 5, -0.3, 0, Math.PI * 2)
    ctx.fill()
  }, [])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    const intervalId = setInterval(gameLoop, 1000 / 60)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearInterval(intervalId)
    }
  }, [isOpen, gameStarted, gameOver, gameLoop, jump])

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score)
      if (typeof window !== "undefined") {
        localStorage.setItem("flappyHighScore", String(score))
      }
    }
  }, [gameOver, score, highScore])

  const startGame = () => {
    setScore(0)
    setGameOver(false)
    gameStateRef.current = {
      birdY: CANVAS_HEIGHT / 2,
      birdVelocity: 0,
      pipes: [],
      frameCount: 0,
    }
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Flappy Bird / फ्लॅपी बर्ड</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🐤</div>
              <h3 className="text-xl font-bold mb-2">Flappy Bird / फ्लॅपी बर्ड</h3>
              <p className="text-muted-foreground mb-2">
                Tap or press Space to fly through the pipes!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                पाईप्समधून उडण्यासाठी टॅप करा किंवा स्पेस दाबा!
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
              <div className="text-xl font-bold">Score: {score}</div>
              
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg border border-border cursor-pointer"
                onClick={jump}
                onTouchStart={(e) => {
                  e.preventDefault()
                  jump()
                }}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Tap or Press Space to flap / टॅप करा किंवा स्पेस दाबा
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
