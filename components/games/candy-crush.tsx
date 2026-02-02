"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CandyCrushProps {
  isOpen: boolean
  onClose: () => void
}

const BOARD_SIZE = 8
const CANDY_TYPES = ["🍬", "🍭", "🍫", "🍩", "🧁", "🍪"]

type Cell = {
  type: number
  id: number
}

export function CandyCrush({ isOpen, onClose }: CandyCrushProps) {
  const [board, setBoard] = useState<Cell[][]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(30)
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [idCounter, setIdCounter] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("candyCrushHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const createBoard = useCallback(() => {
    let counter = 0
    const newBoard: Cell[][] = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      const newRow: Cell[] = []
      for (let col = 0; col < BOARD_SIZE; col++) {
        newRow.push({
          type: Math.floor(Math.random() * CANDY_TYPES.length),
          id: counter++,
        })
      }
      newBoard.push(newRow)
    }
    setIdCounter(counter)
    return newBoard
  }, [])

  const checkMatches = useCallback((currentBoard: Cell[][]): { row: number; col: number }[] => {
    const matches: { row: number; col: number }[] = []

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const type = currentBoard[row][col].type
        if (
          type === currentBoard[row][col + 1].type &&
          type === currentBoard[row][col + 2].type
        ) {
          matches.push({ row, col })
          matches.push({ row, col: col + 1 })
          matches.push({ row, col: col + 2 })
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE - 2; row++) {
        const type = currentBoard[row][col].type
        if (
          type === currentBoard[row + 1][col].type &&
          type === currentBoard[row + 2][col].type
        ) {
          matches.push({ row, col })
          matches.push({ row: row + 1, col })
          matches.push({ row: row + 2, col })
        }
      }
    }

    // Remove duplicates
    const unique = matches.filter(
      (match, index, self) =>
        index === self.findIndex((m) => m.row === match.row && m.col === match.col)
    )
    return unique
  }, [])

  const removeMatchesAndFill = useCallback((currentBoard: Cell[][], matches: { row: number; col: number }[]) => {
    let counter = idCounter
    const newBoard = currentBoard.map((row) => row.map((cell) => ({ ...cell })))

    // Mark matched cells as empty (-1)
    matches.forEach(({ row, col }) => {
      newBoard[row][col].type = -1
    })

    // Drop candies down
    for (let col = 0; col < BOARD_SIZE; col++) {
      let emptySpaces = 0
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col].type === -1) {
          emptySpaces++
        } else if (emptySpaces > 0) {
          newBoard[row + emptySpaces][col] = newBoard[row][col]
          newBoard[row][col] = { type: -1, id: counter++ }
        }
      }
      // Fill top with new candies
      for (let row = 0; row < emptySpaces; row++) {
        newBoard[row][col] = {
          type: Math.floor(Math.random() * CANDY_TYPES.length),
          id: counter++,
        }
      }
    }

    setIdCounter(counter)
    return newBoard
  }, [idCounter])

  const processBoard = useCallback((currentBoard: Cell[][]) => {
    let newBoard = currentBoard
    let totalMatches = 0

    const processMatches = () => {
      const matches = checkMatches(newBoard)
      if (matches.length > 0) {
        totalMatches += matches.length
        newBoard = removeMatchesAndFill(newBoard, matches)
        setTimeout(processMatches, 300)
      } else {
        setBoard(newBoard)
        setScore((prev) => prev + totalMatches * 10)
      }
    }

    processMatches()
  }, [checkMatches, removeMatchesAndFill])

  const isAdjacent = (
    pos1: { row: number; col: number },
    pos2: { row: number; col: number }
  ) => {
    const rowDiff = Math.abs(pos1.row - pos2.row)
    const colDiff = Math.abs(pos1.col - pos2.col)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  const swapCandies = (
    pos1: { row: number; col: number },
    pos2: { row: number; col: number }
  ) => {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
    const temp = newBoard[pos1.row][pos1.col]
    newBoard[pos1.row][pos1.col] = newBoard[pos2.row][pos2.col]
    newBoard[pos2.row][pos2.col] = temp

    const matches = checkMatches(newBoard)
    if (matches.length > 0) {
      setBoard(newBoard)
      setMoves((prev) => prev - 1)
      setTimeout(() => processBoard(newBoard), 200)
    }
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || moves <= 0) return

    if (selected === null) {
      setSelected({ row, col })
    } else {
      if (isAdjacent(selected, { row, col })) {
        swapCandies(selected, { row, col })
      }
      setSelected(null)
    }
  }

  useEffect(() => {
    if (moves <= 0 && gameStarted) {
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
        if (typeof window !== "undefined") {
          localStorage.setItem("candyCrushHighScore", String(score))
        }
      }
    }
  }, [moves, gameStarted, score, highScore])

  const startGame = () => {
    const newBoard = createBoard()
    setBoard(newBoard)
    setScore(0)
    setMoves(30)
    setSelected(null)
    setGameOver(false)
    setGameStarted(true)

    // Initial match clearing
    setTimeout(() => processBoard(newBoard), 500)
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
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Candy Crush / कँडी क्रश</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🍬</div>
              <h3 className="text-xl font-bold mb-2">Candy Match / कँडी जुळवा</h3>
              <p className="text-muted-foreground mb-2">
                Match 3 or more candies to score points!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                गुण मिळवण्यासाठी 3 किंवा अधिक कँडी जुळवा!
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{moves}</p>
                  <p className="text-xs text-muted-foreground">Moves</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div
                  className="grid gap-1 p-2 bg-secondary/50 rounded-lg"
                  style={{
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <motion.button
                        key={cell.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl rounded-lg transition-all ${
                          selected?.row === rowIndex && selected?.col === colIndex
                            ? "bg-primary/30 ring-2 ring-primary"
                            : "bg-card hover:bg-secondary"
                        }`}
                      >
                        {CANDY_TYPES[cell.type]}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Tap two adjacent candies to swap / जुळवण्यासाठी दोन शेजारच्या कँडी टॅप करा
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
