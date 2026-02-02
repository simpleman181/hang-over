"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, RotateCcw, Shuffle } from "lucide-react"

interface PuzzleGameProps {
  isOpen: boolean
  onClose: () => void
}

const GRID_SIZE = 3
const TOTAL_TILES = GRID_SIZE * GRID_SIZE

export function PuzzleGame({ isOpen, onClose }: PuzzleGameProps) {
  const [tiles, setTiles] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [bestMoves, setBestMoves] = useState<number | null>(null)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("puzzleBestMoves")
      if (saved) setBestMoves(Number(saved))
    }
  }, [])

  const isSolvable = (arr: number[]) => {
    let inversions = 0
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== 0 && arr[j] !== 0 && arr[i] > arr[j]) {
          inversions++
        }
      }
    }
    return inversions % 2 === 0
  }

  const shuffleTiles = useCallback(() => {
    let shuffled: number[]
    do {
      shuffled = Array.from({ length: TOTAL_TILES }, (_, i) => i)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
    } while (!isSolvable(shuffled))
    
    setTiles(shuffled)
    setMoves(0)
    setGameWon(false)
    setTimer(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (isOpen && tiles.length === 0) {
      shuffleTiles()
    }
  }, [isOpen, tiles.length, shuffleTiles])

  useEffect(() => {
    if (!isOpen) {
      setTiles([])
      setMoves(0)
      setGameWon(false)
      setTimer(0)
      setIsPlaying(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isPlaying || gameWon) return

    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, gameWon])

  const checkWin = (currentTiles: number[]) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) return false
    }
    return currentTiles[currentTiles.length - 1] === 0
  }

  const handleTileClick = (index: number) => {
    if (gameWon || tiles[index] === 0) return

    const emptyIndex = tiles.indexOf(0)
    const row = Math.floor(index / GRID_SIZE)
    const col = index % GRID_SIZE
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE)
    const emptyCol = emptyIndex % GRID_SIZE

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)

    if (isAdjacent) {
      const newTiles = [...tiles]
      ;[newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]]
      setTiles(newTiles)
      setMoves(prev => prev + 1)

      if (checkWin(newTiles)) {
        setGameWon(true)
        setIsPlaying(false)
        const finalMoves = moves + 1
        if (bestMoves === null || finalMoves < bestMoves) {
          setBestMoves(finalMoves)
          if (typeof window !== "undefined") {
            localStorage.setItem("puzzleBestMoves", String(finalMoves))
          }
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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
          className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Slide Puzzle</h3>
              <p className="text-sm text-muted-foreground font-mono">स्लाइड पझल</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Game content */}
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-lg font-bold text-card-foreground font-mono">{formatTime(timer)}</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">Moves</p>
                <p className="text-lg font-bold text-card-foreground">{moves}</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">Best</p>
                </div>
                <p className="text-lg font-bold text-card-foreground">{bestMoves ?? "-"}</p>
              </div>
            </div>

            {/* Puzzle grid */}
            <div className="grid grid-cols-3 gap-2 mb-6 aspect-square">
              {tiles.map((tile, index) => (
                <motion.button
                  key={tile}
                  type="button"
                  onClick={() => handleTileClick(index)}
                  disabled={tile === 0 || gameWon}
                  className={`
                    aspect-square rounded-xl font-bold text-2xl transition-all
                    ${tile === 0 
                      ? "bg-transparent" 
                      : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-lg"
                    }
                  `}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {tile !== 0 && tile}
                </motion.button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={shuffleTiles}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                New Game
              </button>
            </div>

            {/* Win message */}
            {gameWon && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6 text-center bg-green-500/20 border border-green-500/30 rounded-xl p-4"
              >
                <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                  जिंकलात! You Won!
                </h4>
                <p className="text-sm text-muted-foreground">
                  Solved in {moves} moves and {formatTime(timer)}
                </p>
                <button
                  type="button"
                  onClick={shuffleTiles}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors mx-auto mt-3"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </motion.div>
            )}

            {/* Instructions */}
            {!gameWon && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Arrange numbers 1-8 in order
                <br />
                <span className="font-mono text-xs">1-8 क्रमांक क्रमाने लावा</span>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
