"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConnectFourProps {
  isOpen: boolean
  onClose: () => void
}

type Player = 1 | 2 | null
type Board = Player[][]

const ROWS = 6
const COLS = 7

export function ConnectFour({ isOpen, onClose }: ConnectFourProps) {
  const [board, setBoard] = useState<Board>(() => 
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [winner, setWinner] = useState<Player>(null)
  const [winningCells, setWinningCells] = useState<[number, number][]>([])
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [vsAI, setVsAI] = useState(true)
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("connectFourScores")
      if (saved) setScores(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (scores.player1 > 0 || scores.player2 > 0) {
      localStorage.setItem("connectFourScores", JSON.stringify(scores))
    }
  }, [scores])

  const checkWinner = (board: Board, row: number, col: number, player: Player): [number, number][] | null => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1],  // diagonal down-left
    ]

    for (const [dr, dc] of directions) {
      const cells: [number, number][] = [[row, col]]
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const r = row + dr * i
        const c = col + dc * i
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
          cells.push([r, c])
        } else break
      }
      
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const r = row - dr * i
        const c = col - dc * i
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
          cells.push([r, c])
        } else break
      }
      
      if (cells.length >= 4) return cells
    }
    
    return null
  }

  const getAvailableRow = (board: Board, col: number): number => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === null) return row
    }
    return -1
  }

  const evaluateBoard = (board: Board, player: Player): number => {
    let score = 0
    const opponent = player === 1 ? 2 : 1

    // Center column preference
    const centerCol = Math.floor(COLS / 2)
    let centerCount = 0
    for (let row = 0; row < ROWS; row++) {
      if (board[row][centerCol] === player) centerCount++
    }
    score += centerCount * 3

    // Check all possible 4-cell windows
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
    
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        for (const [dr, dc] of directions) {
          const window: Player[] = []
          for (let i = 0; i < 4; i++) {
            const r = row + dr * i
            const c = col + dc * i
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
              window.push(board[r][c])
            }
          }
          if (window.length === 4) {
            const playerCount = window.filter(c => c === player).length
            const emptyCount = window.filter(c => c === null).length
            const opponentCount = window.filter(c => c === opponent).length
            
            if (playerCount === 4) score += 100
            else if (playerCount === 3 && emptyCount === 1) score += 5
            else if (playerCount === 2 && emptyCount === 2) score += 2
            
            if (opponentCount === 3 && emptyCount === 1) score -= 4
          }
        }
      }
    }
    
    return score
  }

  const minimax = (board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number => {
    // Check for terminal states
    for (let col = 0; col < COLS; col++) {
      const row = getAvailableRow(board, col)
      if (row === -1) continue
      // Temporarily place piece to check
      board[row][col] = maximizing ? 1 : 2
      const win = checkWinner(board, row, col, maximizing ? 1 : 2)
      board[row][col] = null
      if (win) return maximizing ? -1000 : 1000
    }
    
    const isFull = board[0].every(cell => cell !== null)
    if (depth === 0 || isFull) {
      return evaluateBoard(board, 2)
    }

    if (maximizing) {
      let maxEval = -Infinity
      for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(board, col)
        if (row === -1) continue
        board[row][col] = 2
        const evalScore = minimax(board, depth - 1, alpha, beta, false)
        board[row][col] = null
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (let col = 0; col < COLS; col++) {
        const row = getAvailableRow(board, col)
        if (row === -1) continue
        board[row][col] = 1
        const evalScore = minimax(board, depth - 1, alpha, beta, true)
        board[row][col] = null
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  const getBestMove = (board: Board): number => {
    let bestScore = -Infinity
    let bestCol = 3 // Default to center
    
    for (let col = 0; col < COLS; col++) {
      const row = getAvailableRow(board, col)
      if (row === -1) continue
      
      board[row][col] = 2
      const score = minimax(board, 4, -Infinity, Infinity, false)
      board[row][col] = null
      
      if (score > bestScore) {
        bestScore = score
        bestCol = col
      }
    }
    
    return bestCol
  }

  useEffect(() => {
    if (vsAI && currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        const col = getBestMove(board.map(row => [...row]))
        dropPiece(col)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, vsAI, winner])

  const dropPiece = (col: number) => {
    if (winner) return
    
    const row = getAvailableRow(board, col)
    if (row === -1) return
    
    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer
    setBoard(newBoard)
    
    const winning = checkWinner(newBoard, row, col, currentPlayer)
    if (winning) {
      setWinner(currentPlayer)
      setWinningCells(winning)
      setScores(s => ({
        ...s,
        [currentPlayer === 1 ? "player1" : "player2"]: s[currentPlayer === 1 ? "player1" : "player2"] + 1
      }))
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }
  }

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
    setCurrentPlayer(1)
    setWinner(null)
    setWinningCells([])
  }

  if (!isOpen) return null

  const isWinningCell = (row: number, col: number) => 
    winningCells.some(([r, c]) => r === row && c === col)

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
              <h2 className="text-2xl font-bold text-card-foreground">Connect Four</h2>
              <p className="text-sm text-muted-foreground">चार जोडा</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={vsAI ? "default" : "outline"}
              size="sm"
              onClick={() => { setVsAI(true); resetGame() }}
              className="flex-1"
            >
              vs AI
            </Button>
            <Button
              variant={!vsAI ? "default" : "outline"}
              size="sm"
              onClick={() => { setVsAI(false); resetGame() }}
              className="flex-1"
            >
              2 Players
            </Button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">{vsAI ? "You" : "Player 1"}</div>
              <div className="text-xl font-bold text-card-foreground">{scores.player1}</div>
            </div>
            <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
              <div className="w-4 h-4 rounded-full bg-yellow-500 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">{vsAI ? "AI" : "Player 2"}</div>
              <div className="text-xl font-bold text-card-foreground">{scores.player2}</div>
            </div>
          </div>

          {/* Game status */}
          <div className="text-center mb-4">
            {winner ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="font-bold text-card-foreground">
                  {vsAI ? (winner === 1 ? "You Win!" : "AI Wins!") : `Player ${winner} Wins!`}
                </p>
                <p className="text-sm text-accent">खेळ खल्लास ! GAME OVER</p>
              </motion.div>
            ) : (
              <p className="text-muted-foreground">
                {vsAI && currentPlayer === 2 ? "AI thinking..." : `${vsAI && currentPlayer === 1 ? "Your" : `Player ${currentPlayer}'s`} turn`}
              </p>
            )}
          </div>

          {/* Board */}
          <div className="bg-primary rounded-xl p-2 mb-4">
            {/* Column buttons */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {Array(COLS).fill(null).map((_, col) => (
                <button
                  key={col}
                  type="button"
                  className="h-6 rounded-t-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                  onClick={() => dropPiece(col)}
                  onMouseEnter={() => setHoveredCol(col)}
                  onMouseLeave={() => setHoveredCol(null)}
                  disabled={!!winner || getAvailableRow(board, col) === -1 || (vsAI && currentPlayer === 2)}
                />
              ))}
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`aspect-square rounded-full flex items-center justify-center
                      ${cell === null ? "bg-card" : ""}
                      ${cell === 1 ? "bg-red-500" : ""}
                      ${cell === 2 ? "bg-yellow-500" : ""}
                      ${isWinningCell(rowIndex, colIndex) ? "ring-2 ring-white" : ""}
                      ${hoveredCol === colIndex && cell === null ? "bg-muted" : ""}`}
                    initial={cell ? { scale: 0, y: -50 } : {}}
                    animate={cell ? { scale: 1, y: 0 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))
              )}
            </div>
          </div>

          <Button onClick={resetGame} className="w-full bg-transparent" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game / नवीन खेळ
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
