"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TicTacToeProps {
  isOpen: boolean
  onClose: () => void
}

type Player = "X" | "O" | null
type Board = Player[]

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
]

export function TicTacToe({ isOpen, onClose }: TicTacToeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player | "draw">(null)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [vsAI, setVsAI] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tictactoeScores")
      if (saved) setScores(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (scores.X > 0 || scores.O > 0 || scores.draws > 0) {
      localStorage.setItem("tictactoeScores", JSON.stringify(scores))
    }
  }, [scores])

  const checkWinner = (squares: Board): Player | "draw" | null => {
    for (const [a, b, c] of winningCombinations) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine([a, b, c])
        return squares[a]
      }
    }
    if (squares.every(square => square !== null)) {
      return "draw"
    }
    return null
  }

  const minimax = (squares: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinnerSimple(squares)
    if (result === "O") return 10 - depth
    if (result === "X") return depth - 10
    if (squares.every(s => s !== null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "O"
          const score = minimax(squares, depth + 1, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "X"
          const score = minimax(squares, depth + 1, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const checkWinnerSimple = (squares: Board): Player | null => {
    for (const [a, b, c] of winningCombinations) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const getBestMove = (squares: Board): number => {
    let bestScore = -Infinity
    let bestMove = 0
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = "O"
        const score = minimax(squares, 0, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  useEffect(() => {
    if (vsAI && currentPlayer === "O" && !winner) {
      const timer = setTimeout(() => {
        const newBoard = [...board]
        const move = getBestMove(newBoard)
        newBoard[move] = "O"
        setBoard(newBoard)
        const result = checkWinner(newBoard)
        if (result) {
          setWinner(result)
          if (result === "draw") {
            setScores(s => ({ ...s, draws: s.draws + 1 }))
          } else {
            setScores(s => ({ ...s, [result]: s[result] + 1 }))
          }
        } else {
          setCurrentPlayer("X")
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, vsAI, winner, board])

  const handleClick = (index: number) => {
    if (board[index] || winner) return
    if (vsAI && currentPlayer === "O") return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result) {
      setWinner(result)
      if (result === "draw") {
        setScores(s => ({ ...s, draws: s.draws + 1 }))
      } else {
        setScores(s => ({ ...s, [result]: s[result] + 1 }))
      }
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setWinningLine(null)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    localStorage.removeItem("tictactoeScores")
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Tic Tac Toe</h2>
              <p className="text-sm text-muted-foreground">टिक टॅक टो</p>
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
              vs AI / AI विरुद्ध
            </Button>
            <Button
              variant={!vsAI ? "default" : "outline"}
              size="sm"
              onClick={() => { setVsAI(false); resetGame() }}
              className="flex-1"
            >
              2 Players / २ खेळाडू
            </Button>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-primary/10 rounded-lg p-2">
              <div className="text-lg font-bold text-primary">X</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.X}</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-sm text-muted-foreground">Draws</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.draws}</div>
            </div>
            <div className="bg-accent/10 rounded-lg p-2">
              <div className="text-lg font-bold text-accent">O</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.O}</div>
            </div>
          </div>

          {/* Game status */}
          <div className="text-center mb-4">
            {winner ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xl font-bold"
              >
                {winner === "draw" ? (
                  <span className="text-muted-foreground">Draw! बरोबरी!</span>
                ) : (
                  <span className="text-primary flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {winner} Wins! {winner} जिंकला!
                  </span>
                )}
                <p className="text-sm text-accent mt-1">खेळ खल्लास ! GAME OVER</p>
              </motion.div>
            ) : (
              <p className="text-muted-foreground">
                {currentPlayer === "X" ? "Your turn (X)" : vsAI ? "AI thinking..." : "O's turn"}
                <br />
                <span className="text-sm">
                  {currentPlayer === "X" ? "तुमची पाळी (X)" : vsAI ? "AI विचार करत आहे..." : "O ची पाळी"}
                </span>
              </p>
            )}
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                type="button"
                className={`aspect-square rounded-xl text-4xl font-bold flex items-center justify-center transition-colors
                  ${cell ? "bg-secondary" : "bg-muted hover:bg-secondary"}
                  ${winningLine?.includes(index) ? "bg-primary/20 ring-2 ring-primary" : ""}
                  ${cell === "X" ? "text-primary" : "text-accent"}`}
                onClick={() => handleClick(index)}
                whileHover={{ scale: cell ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!!cell || !!winner || (vsAI && currentPlayer === "O")}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={resetGame} className="flex-1 bg-transparent" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game / नवीन खेळ
            </Button>
            <Button onClick={resetScores} variant="ghost" size="sm">
              Reset Scores
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
