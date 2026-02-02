"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCw, ArrowDown, ArrowLeft, ArrowRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TetrisGameProps {
  isOpen: boolean
  onClose: () => void
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const EMPTY_CELL = 0

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "#00f5ff" },
  O: { shape: [[1, 1], [1, 1]], color: "#ffd700" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "#a855f7" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "#22c55e" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "#ef4444" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "#3b82f6" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "#f97316" },
}

type TetrominoType = keyof typeof TETROMINOES

const createEmptyBoard = () => 
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(EMPTY_CELL))

const randomTetromino = (): TetrominoType => {
  const types = Object.keys(TETROMINOES) as TetrominoType[]
  return types[Math.floor(Math.random() * types.length)]
}

export function TetrisGame({ isOpen, onClose }: TetrisGameProps) {
  const [board, setBoard] = useState<(number | string)[][]>(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState<TetrominoType | null>(null)
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [currentRotation, setCurrentRotation] = useState(0)
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tetrisHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const getRotatedShape = useCallback((type: TetrominoType, rotation: number) => {
    let shape = TETROMINOES[type].shape
    for (let i = 0; i < rotation % 4; i++) {
      const rows = shape.length
      const cols = shape[0].length
      const rotated: number[][] = []
      for (let c = 0; c < cols; c++) {
        rotated.push([])
        for (let r = rows - 1; r >= 0; r--) {
          rotated[c].push(shape[r][c])
        }
      }
      shape = rotated
    }
    return shape
  }, [])

  const isValidMove = useCallback((newX: number, newY: number, rotation: number, piece: TetrominoType) => {
    const shape = getRotatedShape(piece, rotation)
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false
          }
          if (boardY >= 0 && board[boardY][boardX] !== EMPTY_CELL) {
            return false
          }
        }
      }
    }
    return true
  }, [board, getRotatedShape])

  const placePiece = useCallback(() => {
    if (!currentPiece) return

    const shape = getRotatedShape(currentPiece, currentRotation)
    const newBoard = board.map(row => [...row])
    const color = TETROMINOES[currentPiece].color

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = currentPos.y + y
          const boardX = currentPos.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = color
          }
        }
      }
    }

    // Check for completed lines
    let completedLines = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== EMPTY_CELL)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL))
        completedLines++
        y++ // Check same row again
      }
    }

    if (completedLines > 0) {
      const points = [0, 100, 300, 500, 800][completedLines] * level
      setScore(prev => prev + points)
      setLines(prev => {
        const newLines = prev + completedLines
        setLevel(Math.floor(newLines / 10) + 1)
        return newLines
      })
    }

    setBoard(newBoard)

    // Spawn new piece
    const newPiece = nextPiece || randomTetromino()
    const startX = Math.floor((BOARD_WIDTH - TETROMINOES[newPiece].shape[0].length) / 2)
    
    if (!isValidMove(startX, 0, 0, newPiece)) {
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
        if (typeof window !== "undefined") {
          localStorage.setItem("tetrisHighScore", String(score))
        }
      }
      return
    }

    setCurrentPiece(newPiece)
    setCurrentPos({ x: startX, y: 0 })
    setCurrentRotation(0)
    setNextPiece(randomTetromino())
  }, [currentPiece, currentPos, currentRotation, board, getRotatedShape, isValidMove, nextPiece, level, score, highScore])

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return

    if (isValidMove(currentPos.x, currentPos.y + 1, currentRotation, currentPiece)) {
      setCurrentPos(prev => ({ ...prev, y: prev.y + 1 }))
    } else {
      placePiece()
    }
  }, [currentPiece, currentPos, currentRotation, isValidMove, placePiece, isPaused, gameOver])

  const moveLeft = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    if (isValidMove(currentPos.x - 1, currentPos.y, currentRotation, currentPiece)) {
      setCurrentPos(prev => ({ ...prev, x: prev.x - 1 }))
    }
  }, [currentPiece, currentPos, currentRotation, isValidMove, isPaused, gameOver])

  const moveRight = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    if (isValidMove(currentPos.x + 1, currentPos.y, currentRotation, currentPiece)) {
      setCurrentPos(prev => ({ ...prev, x: prev.x + 1 }))
    }
  }, [currentPiece, currentPos, currentRotation, isValidMove, isPaused, gameOver])

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    const newRotation = (currentRotation + 1) % 4
    if (isValidMove(currentPos.x, currentPos.y, newRotation, currentPiece)) {
      setCurrentRotation(newRotation)
    }
  }, [currentPiece, currentPos, currentRotation, isValidMove, isPaused, gameOver])

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    let newY = currentPos.y
    while (isValidMove(currentPos.x, newY + 1, currentRotation, currentPiece)) {
      newY++
    }
    setCurrentPos(prev => ({ ...prev, y: newY }))
    setTimeout(placePiece, 50)
  }, [currentPiece, currentPos, currentRotation, isValidMove, placePiece, isPaused, gameOver])

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }

    const speed = Math.max(100, 1000 - (level - 1) * 100)
    gameLoopRef.current = setInterval(moveDown, speed)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, isPaused, level, moveDown])

  useEffect(() => {
    if (!isOpen || !gameStarted || gameOver || isPaused) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          e.preventDefault()
          moveLeft()
          break
        case "ArrowRight":
        case "d":
          e.preventDefault()
          moveRight()
          break
        case "ArrowDown":
        case "s":
          e.preventDefault()
          moveDown()
          break
        case "ArrowUp":
        case "w":
          e.preventDefault()
          rotate()
          break
        case " ":
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, gameStarted, gameOver, isPaused, moveLeft, moveRight, moveDown, rotate, hardDrop])

  const startGame = () => {
    setBoard(createEmptyBoard())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    
    const firstPiece = randomTetromino()
    const startX = Math.floor((BOARD_WIDTH - TETROMINOES[firstPiece].shape[0].length) / 2)
    setCurrentPiece(firstPiece)
    setCurrentPos({ x: startX, y: 0 })
    setCurrentRotation(0)
    setNextPiece(randomTetromino())
    setGameStarted(true)
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setBoard(createEmptyBoard())
    setCurrentPiece(null)
    setScore(0)
    setLines(0)
    setLevel(1)
  }

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row])
    
    if (currentPiece && !gameOver) {
      const shape = getRotatedShape(currentPiece, currentRotation)
      const color = TETROMINOES[currentPiece].color
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = currentPos.y + y
            const boardX = currentPos.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = color
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-5 h-5 sm:w-6 sm:h-6 border border-border/30"
            style={{
              backgroundColor: cell !== EMPTY_CELL ? String(cell) : "transparent",
              boxShadow: cell !== EMPTY_CELL ? "inset 2px 2px 4px rgba(255,255,255,0.3)" : "none"
            }}
          />
        ))}
      </div>
    ))
  }

  const renderNextPiece = () => {
    if (!nextPiece) return null
    const shape = TETROMINOES[nextPiece].shape
    const color = TETROMINOES[nextPiece].color

    return (
      <div className="flex flex-col items-center">
        {shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={x}
                className="w-4 h-4"
                style={{
                  backgroundColor: cell ? color : "transparent",
                  boxShadow: cell ? "inset 1px 1px 2px rgba(255,255,255,0.3)" : "none"
                }}
              />
            ))}
          </div>
        ))}
      </div>
    )
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
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Tetris / टेट्रिस</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧱</div>
              <h3 className="text-xl font-bold mb-2">Tetris / टेट्रिस</h3>
              <p className="text-muted-foreground mb-2">
                Arrange falling blocks to complete lines!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                पडणारे ब्लॉक्स रेषा पूर्ण करण्यासाठी लावा!
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Arrow keys / WASD to move, Space for hard drop
                <br />
                हलवण्यासाठी ॲरो की, हार्ड ड्रॉपसाठी स्पेस
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
              <p className="text-muted-foreground mb-2">Lines: {lines} | Level: {level}</p>
              {score >= highScore && score > 0 && (
                <p className="text-primary font-bold mb-4">New High Score! / नवीन उच्च गुण!</p>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={startGame} type="button">Play Again / पुन्हा खेळा</Button>
                <Button variant="outline" onClick={resetGame} type="button">Menu / मेनू</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="bg-secondary/50 p-2 rounded-lg">
                {renderBoard()}
              </div>
              
              <div className="flex flex-col gap-4 min-w-[120px]">
                <div className="bg-secondary/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Next</p>
                  <div className="flex justify-center">{renderNextPiece()}</div>
                </div>
                
                <div className="bg-secondary/50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="bg-secondary/50 p-2 rounded-lg text-center flex-1">
                    <p className="text-lg font-bold">{lines}</p>
                    <p className="text-xs text-muted-foreground">Lines</p>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-lg text-center flex-1">
                    <p className="text-lg font-bold">{level}</p>
                    <p className="text-xs text-muted-foreground">Level</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                  type="button"
                  className="w-full"
                >
                  {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>

                {/* Mobile controls */}
                <div className="grid grid-cols-3 gap-1 sm:hidden">
                  <div />
                  <Button variant="secondary" size="sm" onClick={rotate} type="button">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <div />
                  <Button variant="secondary" size="sm" onClick={moveLeft} type="button">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={hardDrop} type="button">
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={moveRight} type="button">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
