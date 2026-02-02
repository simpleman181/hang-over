"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Play, RotateCcw } from "lucide-react"

interface SnakeGameProps {
  isOpen: boolean
  onClose: () => void
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

const GRID_SIZE = 15
const CELL_SIZE = 20
const INITIAL_SPEED = 150

export function SnakeGame({ isOpen, onClose }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(INITIAL_SPEED)
  const directionRef = useRef<Direction>("RIGHT")
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("snakeHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y))
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 7, y: 7 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection("RIGHT")
    directionRef.current = "RIGHT"
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setGameStarted(false)
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }, [generateFood])

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }
      const currentDirection = directionRef.current

      switch (currentDirection) {
        case "UP": head.y -= 1; break
        case "DOWN": head.y += 1; break
        case "LEFT": head.x -= 1; break
        case "RIGHT": head.x += 1; break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        setGameStarted(false)
        return prevSnake
      }

      // Check self collision
      if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        setGameOver(true)
        setGameStarted(false)
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10
          if (newScore > highScore) {
            setHighScore(newScore)
            if (typeof window !== "undefined") {
              localStorage.setItem("snakeHighScore", String(newScore))
            }
          }
          return newScore
        })
        setFood(generateFood(newSnake))
        setSpeed(prev => Math.max(50, prev - 5))
        return newSnake
      }

      newSnake.pop()
      return newSnake
    })
  }, [food, generateFood, highScore])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed)
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, speed, moveSnake])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const current = directionRef.current
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (current !== "DOWN") {
            setDirection("UP")
            directionRef.current = "UP"
          }
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (current !== "UP") {
            setDirection("DOWN")
            directionRef.current = "DOWN"
          }
          break
        case "ArrowLeft":
        case "a":
        case "A":
          if (current !== "RIGHT") {
            setDirection("LEFT")
            directionRef.current = "LEFT"
          }
          break
        case "ArrowRight":
        case "d":
        case "D":
          if (current !== "LEFT") {
            setDirection("RIGHT")
            directionRef.current = "RIGHT"
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, gameStarted, gameOver])

  useEffect(() => {
    if (!isOpen) resetGame()
  }, [isOpen, resetGame])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Snake Game</h3>
              <p className="text-sm text-muted-foreground font-mono">साप खेळ</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Game area */}
          <div className="p-6 flex flex-col items-center gap-4">
            {/* Score */}
            <div className="flex justify-between w-full max-w-xs">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Score / गुण</p>
                <p className="text-2xl font-bold text-card-foreground">{score}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground uppercase">Best</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{highScore}</p>
              </div>
            </div>

            {/* Game board */}
            <div 
              className="relative bg-secondary rounded-lg overflow-hidden"
              style={{ 
                width: GRID_SIZE * CELL_SIZE, 
                height: GRID_SIZE * CELL_SIZE 
              }}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: GRID_SIZE }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute w-full border-t border-muted-foreground/30"
                    style={{ top: i * CELL_SIZE }}
                  />
                ))}
                {Array.from({ length: GRID_SIZE }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute h-full border-l border-muted-foreground/30"
                    style={{ left: i * CELL_SIZE }}
                  />
                ))}
              </div>

              {/* Snake */}
              {snake.map((segment, index) => (
                <motion.div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className="absolute rounded-sm"
                  style={{
                    left: segment.x * CELL_SIZE,
                    top: segment.y * CELL_SIZE,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    margin: 1,
                    backgroundColor: index === 0 ? "#22c55e" : "#4ade80",
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                />
              ))}

              {/* Food */}
              <motion.div
                className="absolute rounded-full bg-red-500"
                style={{
                  left: food.x * CELL_SIZE + 2,
                  top: food.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />

              {/* Start overlay */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <button
                    type="button"
                    onClick={() => setGameStarted(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start / सुरू करा
                  </button>
                </div>
              )}

              {/* Game over overlay */}
              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                  >
                    <h4 className="text-2xl font-bold text-white mb-1">
                      खेळ खल्लास !
                    </h4>
                    <p className="text-lg text-white/80 mb-4">GAME OVER</p>
                    <p className="text-white/60 mb-4">Final Score: {score}</p>
                    <button
                      type="button"
                      onClick={resetGame}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Controls info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Use Arrow Keys or WASD to move</p>
              <p className="text-xs mt-1 font-mono">बाण किंवा WASD वापरा</p>
            </div>

            {/* Mobile controls */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div />
              <button
                type="button"
                onClick={() => { if (directionRef.current !== "DOWN") { setDirection("UP"); directionRef.current = "UP" } }}
                className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 active:scale-95 transition-all"
                disabled={!gameStarted || gameOver}
              >
                <span className="text-lg">↑</span>
              </button>
              <div />
              <button
                type="button"
                onClick={() => { if (directionRef.current !== "RIGHT") { setDirection("LEFT"); directionRef.current = "LEFT" } }}
                className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 active:scale-95 transition-all"
                disabled={!gameStarted || gameOver}
              >
                <span className="text-lg">←</span>
              </button>
              <button
                type="button"
                onClick={() => { if (directionRef.current !== "UP") { setDirection("DOWN"); directionRef.current = "DOWN" } }}
                className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 active:scale-95 transition-all"
                disabled={!gameStarted || gameOver}
              >
                <span className="text-lg">↓</span>
              </button>
              <button
                type="button"
                onClick={() => { if (directionRef.current !== "LEFT") { setDirection("RIGHT"); directionRef.current = "RIGHT" } }}
                className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 active:scale-95 transition-all"
                disabled={!gameStarted || gameOver}
              >
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
