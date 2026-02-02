"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Play, RotateCcw } from "lucide-react"

interface WhackMoleProps {
  isOpen: boolean
  onClose: () => void
}

const GAME_DURATION = 30
const MOLE_SHOW_TIME = 800
const GRID_SIZE = 9

export function WhackMole({ isOpen, onClose }: WhackMoleProps) {
  const [activeMole, setActiveMole] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const moleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scoreRef = useRef(0)

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("whackHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const showNewMole = useCallback(() => {
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current)
    }
    
    // Random position
    const newPosition = Math.floor(Math.random() * GRID_SIZE)
    setActiveMole(newPosition)
    
    // Hide mole after time
    moleTimeoutRef.current = setTimeout(() => {
      setActiveMole(null)
      setMisses(prev => prev + 1)
    }, MOLE_SHOW_TIME)
  }, [])

  const resetGame = useCallback(() => {
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setGameStarted(false)
    setGameOver(false)
    setActiveMole(null)
    setHits(0)
    setMisses(0)
    if (moleTimeoutRef.current) {
      clearTimeout(moleTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setActiveMole(null)
          const currentScore = scoreRef.current
          if (currentScore > highScore) {
            setHighScore(currentScore)
            if (typeof window !== "undefined") {
              localStorage.setItem("whackHighScore", String(currentScore))
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver, highScore])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const moleInterval = setInterval(() => {
      showNewMole()
    }, 1000)

    return () => clearInterval(moleInterval)
  }, [gameStarted, gameOver, showNewMole])

  useEffect(() => {
    if (!isOpen) {
      resetGame()
    }
  }, [isOpen, resetGame])

  const handleWhack = (index: number) => {
    if (!gameStarted || gameOver) return
    
    if (index === activeMole) {
      setScore(prev => prev + 10)
      setHits(prev => prev + 1)
      setActiveMole(null)
      if (moleTimeoutRef.current) {
        clearTimeout(moleTimeoutRef.current)
      }
    }
  }

  const startGame = () => {
    setGameStarted(true)
    showNewMole()
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
          className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-card-foreground">Whack-a-Mole</h3>
              <p className="text-sm text-muted-foreground font-mono">छछुंदर मारा</p>
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
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-lg font-bold text-card-foreground">{timeLeft}s</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-lg font-bold text-card-foreground">{score}</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">Hits</p>
                <p className="text-lg font-bold text-green-500">{hits}</p>
              </div>
              <div className="text-center p-2 bg-secondary rounded-lg">
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                </div>
                <p className="text-lg font-bold text-card-foreground">{highScore}</p>
              </div>
            </div>

            {/* Game grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Array.from({ length: GRID_SIZE }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleWhack(index)}
                  disabled={!gameStarted || gameOver}
                  className="relative aspect-square bg-secondary rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95"
                >
                  {/* Hole */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-amber-900/50 rounded-full" />
                  
                  {/* Mole */}
                  <AnimatePresence>
                    {activeMole === index && (
                      <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-amber-600 rounded-full relative">
                          {/* Eyes */}
                          <div className="absolute top-4 left-3 w-3 h-3 bg-white rounded-full">
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full" />
                          </div>
                          <div className="absolute top-4 right-3 w-3 h-3 bg-white rounded-full">
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full" />
                          </div>
                          {/* Nose */}
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-4 h-3 bg-pink-400 rounded-full" />
                          {/* Teeth */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                            <div className="w-2 h-3 bg-white rounded-b" />
                            <div className="w-2 h-3 bg-white rounded-b" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>

            {/* Start/Game Over overlay */}
            {!gameStarted && !gameOver && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={startGame}
                  className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-full font-bold text-lg hover:bg-amber-600 transition-colors mx-auto"
                >
                  <Play className="w-5 h-5" />
                  Start / सुरू करा
                </button>
              </div>
            )}

            {gameOver && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center bg-secondary rounded-xl p-6"
              >
                <h4 className="text-2xl font-bold text-card-foreground mb-1">
                  खेळ खल्लास !
                </h4>
                <p className="text-lg text-muted-foreground mb-2">GAME OVER</p>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Moles Hit</p>
                    <p className="font-bold text-green-500">{hits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="font-bold text-card-foreground">
                      {hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetGame}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors mx-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </motion.div>
            )}

            {/* Instructions */}
            {!gameOver && gameStarted && (
              <p className="text-center text-sm text-muted-foreground">
                Click the moles before they hide!
                <br />
                <span className="font-mono text-xs">छछुंदर लपण्यापूर्वी त्यांना क्लिक करा!</span>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
