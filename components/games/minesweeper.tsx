"use client"

import React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Flag, Bomb, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MinesweeperProps {
  isOpen: boolean
  onClose: () => void
}

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const GRID_SIZE = 8
const MINE_COUNT = 10

export function Minesweeper({ isOpen, onClose }: MinesweeperProps) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [flagCount, setFlagCount] = useState(0)
  const [time, setTime] = useState(0)
  const [isFirstClick, setIsFirstClick] = useState(true)
  const [bestTime, setBestTime] = useState<number | null>(null)

  const createEmptyGrid = useCallback((): Cell[][] => {
    return Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    )
  }, [])

  const placeMines = useCallback((grid: Cell[][], excludeRow: number, excludeCol: number): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    let minesPlaced = 0

    while (minesPlaced < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)

      // Don't place mine on first click or adjacent cells
      const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1

      if (!newGrid[row][col].isMine && !isExcluded) {
        newGrid[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const r = row + dr
              const c = col + dc
              if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && newGrid[r][c].isMine) {
                count++
              }
            }
          }
          newGrid[row][col].neighborMines = count
        }
      }
    }

    return newGrid
  }, [])

  const initGame = useCallback(() => {
    setGrid(createEmptyGrid())
    setGameStatus("playing")
    setFlagCount(0)
    setTime(0)
    setIsFirstClick(true)
  }, [createEmptyGrid])

  useEffect(() => {
    if (isOpen) {
      initGame()
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("minesweeperBest")
        if (saved) setBestTime(Number(saved))
      }
    }
  }, [isOpen, initGame])

  useEffect(() => {
    if (gameStatus !== "playing" || isFirstClick) return

    const timer = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus, isFirstClick])

  const revealCell = useCallback((grid: Cell[][], row: number, col: number): Cell[][] => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return grid
    if (grid[row][col].isRevealed || grid[row][col].isFlagged) return grid

    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    newGrid[row][col].isRevealed = true

    if (newGrid[row][col].neighborMines === 0 && !newGrid[row][col].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            const result = revealCell(newGrid, row + dr, col + dc)
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                newGrid[r][c] = result[r][c]
              }
            }
          }
        }
      }
    }

    return newGrid
  }, [])

  const checkWin = useCallback((grid: Cell[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!grid[row][col].isMine && !grid[row][col].isRevealed) {
          return false
        }
      }
    }
    return true
  }, [])

  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== "playing" || grid[row][col].isFlagged || grid[row][col].isRevealed) return

    let newGrid = grid.map(r => r.map(c => ({ ...c })))

    if (isFirstClick) {
      newGrid = placeMines(newGrid, row, col)
      setIsFirstClick(false)
    }

    if (newGrid[row][col].isMine) {
      // Reveal all mines
      newGrid = newGrid.map(r => r.map(c => c.isMine ? { ...c, isRevealed: true } : c))
      setGrid(newGrid)
      setGameStatus("lost")
      return
    }

    newGrid = revealCell(newGrid, row, col)
    setGrid(newGrid)

    if (checkWin(newGrid)) {
      setGameStatus("won")
      if (bestTime === null || time < bestTime) {
        setBestTime(time)
        localStorage.setItem("minesweeperBest", String(time))
      }
    }
  }

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameStatus !== "playing" || grid[row][col].isRevealed) return

    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged
    setGrid(newGrid)
    setFlagCount(prev => newGrid[row][col].isFlagged ? prev + 1 : prev - 1)
  }

  const getNumberColor = (num: number): string => {
    const colors = ["", "text-blue-600", "text-green-600", "text-red-600", "text-purple-600", "text-orange-600", "text-cyan-600", "text-black", "text-gray-600"]
    return colors[num] || ""
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
              <h2 className="text-2xl font-bold text-card-foreground">Minesweeper</h2>
              <p className="text-sm text-muted-foreground">सुरुंग शोधक</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-red-500/10 rounded-lg p-2 text-center flex items-center justify-center gap-2">
              <Bomb className="w-4 h-4 text-red-500" />
              <span className="font-bold text-card-foreground">{MINE_COUNT - flagCount}</span>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center">
              <span className="font-mono font-bold text-card-foreground">{String(time).padStart(3, "0")}</span>
            </div>
            <div className="bg-green-500/10 rounded-lg p-2 text-center">
              <span className="text-xs text-muted-foreground">Best</span>
              <span className="font-bold text-card-foreground block">{bestTime ?? "-"}</span>
            </div>
          </div>

          {/* Game status */}
          {gameStatus !== "playing" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-4 py-3 rounded-lg bg-secondary"
            >
              {gameStatus === "won" ? (
                <>
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="font-bold text-green-600">You Win! तुम्ही जिंकलात!</p>
                </>
              ) : (
                <>
                  <Bomb className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="font-bold text-red-600">Game Over!</p>
                </>
              )}
              <p className="text-sm text-accent">खेळ खल्लास ! GAME OVER</p>
            </motion.div>
          )}

          {/* Grid */}
          <div className="bg-muted rounded-lg p-2 mb-4">
            <div 
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <motion.button
                    key={`${rowIndex}-${colIndex}`}
                    type="button"
                    className={`aspect-square text-xs font-bold flex items-center justify-center rounded-sm transition-colors
                      ${cell.isRevealed 
                        ? cell.isMine 
                          ? "bg-red-500" 
                          : "bg-card" 
                        : "bg-secondary hover:bg-secondary/70"
                      }
                      ${cell.isFlagged && !cell.isRevealed ? "bg-yellow-500/30" : ""}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                    whileHover={{ scale: cell.isRevealed ? 1 : 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {cell.isRevealed ? (
                      cell.isMine ? (
                        <Bomb className="w-3 h-3 text-white" />
                      ) : cell.neighborMines > 0 ? (
                        <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                      ) : null
                    ) : cell.isFlagged ? (
                      <Flag className="w-3 h-3 text-red-500" />
                    ) : null}
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <p className="text-xs text-muted-foreground text-center mb-4">
            Click to reveal. Right-click to flag.
            <br />
            उघड करण्यासाठी क्लिक करा. ध्वज लावण्यासाठी उजवे-क्लिक करा.
          </p>

          <Button onClick={initGame} className="w-full bg-transparent" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game / नवीन खेळ
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
