"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TowerBlocksProps {
  isOpen: boolean
  onClose: () => void
}

interface Block {
  x: number
  width: number
  color: string
}

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const BLOCK_HEIGHT = 20
const INITIAL_BLOCK_WIDTH = 100
const BLOCK_SPEED = 3

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
]

export function TowerBlocks({ isOpen, onClose }: TowerBlocksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const gameStateRef = useRef({
    blocks: [] as Block[],
    currentBlock: { x: 0, width: INITIAL_BLOCK_WIDTH, direction: 1 },
    baseY: CANVAS_HEIGHT - BLOCK_HEIGHT,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("towerBlocksHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const getBlockColor = (index: number) => COLORS[index % COLORS.length]

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Move current block
    state.currentBlock.x += BLOCK_SPEED * state.currentBlock.direction
    
    // Bounce off walls
    if (state.currentBlock.x + state.currentBlock.width >= CANVAS_WIDTH) {
      state.currentBlock.direction = -1
    } else if (state.currentBlock.x <= 0) {
      state.currentBlock.direction = 1
    }

    // Clear canvas
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw placed blocks
    state.blocks.forEach((block, index) => {
      const y = state.baseY - index * BLOCK_HEIGHT
      ctx.fillStyle = block.color
      ctx.fillRect(block.x, y, block.width, BLOCK_HEIGHT)
      ctx.strokeStyle = "#ffffff33"
      ctx.strokeRect(block.x, y, block.width, BLOCK_HEIGHT)
    })

    // Draw current block
    const currentY = state.baseY - state.blocks.length * BLOCK_HEIGHT
    ctx.fillStyle = getBlockColor(state.blocks.length)
    ctx.fillRect(state.currentBlock.x, currentY, state.currentBlock.width, BLOCK_HEIGHT)
    ctx.strokeStyle = "#ffffff33"
    ctx.strokeRect(state.currentBlock.x, currentY, state.currentBlock.width, BLOCK_HEIGHT)

    // Draw guidelines
    if (state.blocks.length > 0) {
      const lastBlock = state.blocks[state.blocks.length - 1]
      ctx.strokeStyle = "#ffffff22"
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(lastBlock.x, 0)
      ctx.lineTo(lastBlock.x, CANVAS_HEIGHT)
      ctx.moveTo(lastBlock.x + lastBlock.width, 0)
      ctx.lineTo(lastBlock.x + lastBlock.width, CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [])

  const placeBlock = useCallback(() => {
    const state = gameStateRef.current
    const currentBlock = state.currentBlock
    
    if (state.blocks.length === 0) {
      // First block - just place it
      state.blocks.push({
        x: currentBlock.x,
        width: currentBlock.width,
        color: getBlockColor(0),
      })
      setScore(1)
    } else {
      const lastBlock = state.blocks[state.blocks.length - 1]
      
      // Calculate overlap
      const overlapStart = Math.max(currentBlock.x, lastBlock.x)
      const overlapEnd = Math.min(currentBlock.x + currentBlock.width, lastBlock.x + lastBlock.width)
      const overlapWidth = overlapEnd - overlapStart

      if (overlapWidth <= 0) {
        // No overlap - game over
        setGameOver(true)
        const currentScore = state.blocks.length
        if (currentScore > highScore) {
          setHighScore(currentScore)
          if (typeof window !== "undefined") {
            localStorage.setItem("towerBlocksHighScore", String(currentScore))
          }
        }
        return
      }

      // Place the overlapping part
      state.blocks.push({
        x: overlapStart,
        width: overlapWidth,
        color: getBlockColor(state.blocks.length),
      })
      setScore(state.blocks.length)

      // Update current block width for next round
      state.currentBlock.width = overlapWidth
    }

    // Reset position for next block
    state.currentBlock.x = 0
    state.currentBlock.direction = 1

    // Scroll view up if needed
    if (state.blocks.length * BLOCK_HEIGHT > CANVAS_HEIGHT / 2) {
      state.baseY = CANVAS_HEIGHT - BLOCK_HEIGHT + (state.blocks.length * BLOCK_HEIGHT - CANVAS_HEIGHT / 2)
    }
  }, [highScore])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        placeBlock()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    const intervalId = setInterval(gameLoop, 1000 / 60)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearInterval(intervalId)
    }
  }, [isOpen, gameStarted, gameOver, gameLoop, placeBlock])

  const startGame = () => {
    gameStateRef.current = {
      blocks: [],
      currentBlock: { x: 0, width: INITIAL_BLOCK_WIDTH, direction: 1 },
      baseY: CANVAS_HEIGHT - BLOCK_HEIGHT,
    }
    setScore(0)
    setGameOver(false)
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Tower Blocks / टॉवर ब्लॉक्स</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold mb-2">Tower Blocks / टॉवर ब्लॉक्स</h3>
              <p className="text-muted-foreground mb-2">
                Stack blocks as high as you can!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                शक्य तितक्या उंच ब्लॉक्स रचा!
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Tap or press Space to place block
                <br />
                ब्लॉक ठेवण्यासाठी टॅप करा किंवा स्पेस दाबा
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
              <p className="text-2xl font-bold mb-2">Height: {score} blocks</p>
              {score >= highScore && score > 0 && (
                <p className="text-primary font-bold mb-4">New High Score! / नवीन उच्च गुण!</p>
              )}
              <Button onClick={startGame} type="button">
                Play Again / पुन्हा खेळा
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-xl font-bold">Height: {score}</div>
              
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="rounded-lg border border-border cursor-pointer"
                onClick={placeBlock}
                onTouchStart={(e) => {
                  e.preventDefault()
                  placeBlock()
                }}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Tap or Space to place / टॅप करा किंवा स्पेस दाबा
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
