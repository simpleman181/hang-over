"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Play, Pause, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreakoutProps {
  isOpen: boolean
  onClose: () => void
}

interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  visible: boolean
}

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 400
const PADDLE_WIDTH = 60
const PADDLE_HEIGHT = 10
const BALL_RADIUS = 6
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_HEIGHT = 15
const BRICK_PADDING = 4

export function BreakoutGame({ isOpen, onClose }: BreakoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "paused" | "won" | "lost">("idle")
  
  const gameState = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 50,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as Brick[],
    score: 0,
    lives: 3,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("breakoutHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const initBricks = useCallback(() => {
    const bricks: Brick[] = []
    const brickWidth = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"]
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_PADDING + col * (brickWidth + BRICK_PADDING),
          y: BRICK_PADDING + row * (BRICK_HEIGHT + BRICK_PADDING) + 30,
          width: brickWidth,
          height: BRICK_HEIGHT,
          color: colors[row],
          visible: true,
        })
      }
    }
    return bricks
  }, [])

  const resetBall = useCallback(() => {
    gameState.current.ballX = CANVAS_WIDTH / 2
    gameState.current.ballY = CANVAS_HEIGHT - 50
    gameState.current.ballDX = (Math.random() > 0.5 ? 1 : -1) * 3
    gameState.current.ballDY = -3
  }, [])

  const initGame = useCallback(() => {
    gameState.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT - 50,
      ballDX: 3,
      ballDY: -3,
      bricks: initBricks(),
      score: 0,
      lives: 3,
    }
    setScore(0)
    setLives(3)
    setGameStatus("idle")
  }, [initBricks])

  useEffect(() => {
    if (isOpen) {
      initGame()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isOpen, initGame])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameState.current

    // Clear canvas
    ctx.fillStyle = "#1e1b4b"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw bricks
    state.bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 3)
        ctx.fill()
      }
    })

    // Draw paddle
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.roundRect(state.paddleX, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT, 5)
    ctx.fill()

    // Draw ball
    ctx.fillStyle = "#fbbf24"
    ctx.beginPath()
    ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // Draw lives
    for (let i = 0; i < state.lives; i++) {
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.arc(15 + i * 20, 15, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  const update = useCallback(() => {
    const state = gameState.current

    // Move ball
    state.ballX += state.ballDX
    state.ballY += state.ballDY

    // Wall collision
    if (state.ballX <= BALL_RADIUS || state.ballX >= CANVAS_WIDTH - BALL_RADIUS) {
      state.ballDX = -state.ballDX
    }
    if (state.ballY <= BALL_RADIUS) {
      state.ballDY = -state.ballDY
    }

    // Paddle collision
    if (
      state.ballY >= CANVAS_HEIGHT - 20 - BALL_RADIUS &&
      state.ballX >= state.paddleX &&
      state.ballX <= state.paddleX + PADDLE_WIDTH
    ) {
      state.ballDY = -Math.abs(state.ballDY)
      // Add angle based on where ball hits paddle
      const hitPos = (state.ballX - state.paddleX) / PADDLE_WIDTH
      state.ballDX = 6 * (hitPos - 0.5)
    }

    // Bottom collision (lose life)
    if (state.ballY >= CANVAS_HEIGHT) {
      state.lives--
      setLives(state.lives)
      if (state.lives <= 0) {
        setGameStatus("lost")
        return false
      }
      resetBall()
    }

    // Brick collision
    for (const brick of state.bricks) {
      if (brick.visible) {
        if (
          state.ballX >= brick.x &&
          state.ballX <= brick.x + brick.width &&
          state.ballY >= brick.y &&
          state.ballY <= brick.y + brick.height
        ) {
          state.ballDY = -state.ballDY
          brick.visible = false
          state.score += 10
          setScore(state.score)
          
          if (state.score > highScore) {
            setHighScore(state.score)
            localStorage.setItem("breakoutHighScore", String(state.score))
          }
        }
      }
    }

    // Check win
    if (state.bricks.every(b => !b.visible)) {
      setGameStatus("won")
      return false
    }

    return true
  }, [highScore, resetBall])

  const gameLoop = useCallback(() => {
    if (gameStatus !== "playing") return

    const shouldContinue = update()
    draw()

    if (shouldContinue) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameStatus, update, draw])

  useEffect(() => {
    if (gameStatus === "playing") {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameStatus, gameLoop])

  useEffect(() => {
    if (!isOpen || gameStatus !== "playing") return

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      gameState.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2))
    }

    const handleTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      gameState.current.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, x - PADDLE_WIDTH / 2))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        gameState.current.paddleX = Math.max(0, gameState.current.paddleX - 20)
      } else if (e.key === "ArrowRight") {
        gameState.current.paddleX = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, gameState.current.paddleX + 20)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, gameStatus])

  // Initial draw
  useEffect(() => {
    if (isOpen && gameStatus === "idle") {
      draw()
    }
  }, [isOpen, gameStatus, draw])

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
          className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Breakout</h2>
              <p className="text-sm text-muted-foreground">विटा तोडा</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <div className="text-sm text-muted-foreground">Score / गुण</div>
              <div className="text-xl font-bold text-primary">{score}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-2 text-center">
              <div className="text-sm text-muted-foreground">Best / सर्वोत्तम</div>
              <div className="text-xl font-bold text-accent">{highScore}</div>
            </div>
          </div>

          {/* Game canvas */}
          <div className="relative mb-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full rounded-lg border border-border"
              style={{ aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
            />
            
            {/* Overlay for game states */}
            {(gameStatus === "won" || gameStatus === "lost") && (
              <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {gameStatus === "won" ? (
                    <>
                      <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-white">You Win!</p>
                      <p className="text-white/70">तुम्ही जिंकलात!</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-red-500">Game Over!</p>
                      <p className="text-white/70">खेळ खल्लास ! GAME OVER</p>
                    </>
                  )}
                  <p className="text-white mt-2">Score: {score}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {gameStatus === "idle" || gameStatus === "won" || gameStatus === "lost" ? (
              <Button 
                onClick={() => {
                  if (gameStatus !== "idle") initGame()
                  setGameStatus("playing")
                }} 
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {gameStatus === "idle" ? "Start" : "Play Again"}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setGameStatus(gameStatus === "playing" ? "paused" : "playing")} 
                  className="flex-1"
                  variant="outline"
                >
                  {gameStatus === "playing" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {gameStatus === "playing" ? "Pause" : "Resume"}
                </Button>
                <Button onClick={initGame} variant="ghost" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Move mouse/touch to control paddle
            <br />
            पॅडल नियंत्रित करण्यासाठी माउस हलवा
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
