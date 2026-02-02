"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Game2048Props {
  isOpen: boolean
  onClose: () => void
}

type Board = number[][]

const GRID_SIZE = 4

const getEmptyBoard = (): Board => 
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    0: "bg-muted",
    2: "bg-amber-100 text-amber-900",
    4: "bg-amber-200 text-amber-900",
    8: "bg-orange-300 text-white",
    16: "bg-orange-400 text-white",
    32: "bg-orange-500 text-white",
    64: "bg-red-400 text-white",
    128: "bg-yellow-400 text-white",
    256: "bg-yellow-500 text-white",
    512: "bg-yellow-600 text-white",
    1024: "bg-amber-500 text-white",
    2048: "bg-amber-600 text-white",
  }
  return colors[value] || "bg-purple-600 text-white"
}

export function Game2048({ isOpen, onClose }: Game2048Props) {
  const [board, setBoard] = useState<Board>(getEmptyBoard())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const addRandomTile = useCallback((currentBoard: Board): Board => {
    const newBoard = currentBoard.map(row => [...row])
    const emptyCells: [number, number][] = []
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newBoard[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4
    }
    
    return newBoard
  }, [])

  const initGame = useCallback(() => {
    let newBoard = getEmptyBoard()
    newBoard = addRandomTile(newBoard)
    newBoard = addRandomTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }, [addRandomTile])

  useEffect(() => {
    if (isOpen) {
      initGame()
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("2048BestScore")
        if (saved) setBestScore(Number(saved))
      }
    }
  }, [isOpen, initGame])

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score)
      localStorage.setItem("2048BestScore", String(score))
    }
  }, [score, bestScore])

  const canMove = (currentBoard: Board): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) return true
        if (j < GRID_SIZE - 1 && currentBoard[i][j] === currentBoard[i][j + 1]) return true
        if (i < GRID_SIZE - 1 && currentBoard[i][j] === currentBoard[i + 1][j]) return true
      }
    }
    return false
  }

  const moveLeft = (currentBoard: Board): { board: Board; scoreInc: number; moved: boolean } => {
    let scoreInc = 0
    let moved = false
    const newBoard = currentBoard.map(row => {
      const filtered = row.filter(cell => cell !== 0)
      const merged: number[] = []
      
      for (let i = 0; i < filtered.length; i++) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const mergedValue = filtered[i] * 2
          merged.push(mergedValue)
          scoreInc += mergedValue
          if (mergedValue === 2048) setWon(true)
          i++
        } else {
          merged.push(filtered[i])
        }
      }
      
      while (merged.length < GRID_SIZE) {
        merged.push(0)
      }
      
      if (JSON.stringify(merged) !== JSON.stringify(row)) {
        moved = true
      }
      
      return merged
    })
    
    return { board: newBoard, scoreInc, moved }
  }

  const rotateBoard = (currentBoard: Board): Board => {
    const newBoard = getEmptyBoard()
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        newBoard[j][GRID_SIZE - 1 - i] = currentBoard[i][j]
      }
    }
    return newBoard
  }

  const move = useCallback((direction: "left" | "right" | "up" | "down") => {
    if (gameOver) return

    let currentBoard = board.map(row => [...row])
    let rotations = 0
    
    switch (direction) {
      case "right": rotations = 2; break
      case "up": rotations = 1; break
      case "down": rotations = 3; break
    }
    
    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard)
    }
    
    const { board: movedBoard, scoreInc, moved } = moveLeft(currentBoard)
    
    if (!moved) return
    
    currentBoard = movedBoard
    
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      currentBoard = rotateBoard(currentBoard)
    }
    
    currentBoard = addRandomTile(currentBoard)
    setBoard(currentBoard)
    setScore(s => s + scoreInc)
    
    if (!canMove(currentBoard)) {
      setGameOver(true)
    }
  }, [board, gameOver, addRandomTile])

  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault()
        const direction = e.key.replace("Arrow", "").toLowerCase() as "left" | "right" | "up" | "down"
        move(direction)
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, move])

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
              <h2 className="text-2xl font-bold text-card-foreground">2048</h2>
              <p className="text-sm text-muted-foreground">टाइल्स जोडा आणि 2048 मिळवा!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">Score / गुण</div>
              <div className="text-2xl font-bold text-primary">{score}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">Best / सर्वोत्तम</div>
              <div className="text-2xl font-bold text-accent">{bestScore}</div>
            </div>
          </div>

          {/* Game board */}
          <div className="bg-muted/50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-4 gap-2">
              {board.flat().map((cell, index) => (
                <motion.div
                  key={`${index}-${cell}`}
                  className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg ${getTileColor(cell)}`}
                  initial={{ scale: cell ? 0.8 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {cell > 0 && cell}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Game over / Won overlay */}
          {(gameOver || won) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 text-center py-4 bg-secondary rounded-lg"
            >
              {won && !gameOver ? (
                <>
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-card-foreground">You Win! तुम्ही जिंकलात!</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-card-foreground">Game Over!</p>
                  <p className="text-muted-foreground">खेळ खल्लास ! GAME OVER</p>
                </>
              )}
              <p className="text-lg text-primary mt-2">Final Score: {score}</p>
            </motion.div>
          )}

          {/* Mobile controls */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div />
            <Button variant="secondary" onClick={() => move("up")} className="aspect-square">
              <ArrowUp className="w-5 h-5" />
            </Button>
            <div />
            <Button variant="secondary" onClick={() => move("left")} className="aspect-square">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button variant="secondary" onClick={() => move("down")} className="aspect-square">
              <ArrowDown className="w-5 h-5" />
            </Button>
            <Button variant="secondary" onClick={() => move("right")} className="aspect-square">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Instructions & Reset */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Arrow keys / बाण वापरा
            </p>
            <Button onClick={initGame} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
