"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, Zap, Target } from "lucide-react"

interface ClickerGameProps {
  isOpen: boolean
  onClose: () => void
}

interface FloatingNumber {
  id: number
  x: number
  y: number
  value: number
}

export function ClickerGame({ isOpen, onClose }: ClickerGameProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([])
  const [combo, setCombo] = useState(0)
  
  const lastClickTimeRef = useRef(0)
  const comboRef = useRef(0)

  // Keep combo ref in sync
  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clickerHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  // Handle high score when game ends
  useEffect(() => {
    if (gameOver && score > 0) {
      if (score > highScore) {
        setHighScore(score)
        if (typeof window !== "undefined") {
          localStorage.setItem("clickerHighScore", String(score))
        }
      }
    }
  }, [gameOver, score, highScore])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return

    const now = Date.now()
    const timeDiff = now - lastClickTimeRef.current

    // Combo system - faster clicks = bigger combo
    let newCombo = comboRef.current
    if (timeDiff < 300) {
      newCombo = Math.min(newCombo + 1, 10)
    } else {
      newCombo = 0
    }
    setCombo(newCombo)
    lastClickTimeRef.current = now

    const points = 1 + Math.floor(newCombo / 2)
    setScore((prev) => prev + points)

    // Add floating number
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newFloat: FloatingNumber = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: points,
    }

    setFloatingNumbers((prev) => [...prev, newFloat])

    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((f) => f.id !== newFloat.id))
    }, 800)
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(10)
    setGameStarted(true)
    setGameOver(false)
    setCombo(0)
    setFloatingNumbers([])
    lastClickTimeRef.current = 0
    comboRef.current = 0
  }

  const handleClose = () => {
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setTimeLeft(10)
    setCombo(0)
    setFloatingNumbers([])
    lastClickTimeRef.current = 0
    comboRef.current = 0
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <motion.div
          className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Click Challenge</h2>
              <p className="text-sm text-muted-foreground font-mono">क्लिक आव्हान</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              type="button"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Game area */}
          <div className="p-6">
            {!gameStarted && !gameOver && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Target className="w-16 h-16 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold text-card-foreground mb-2">
                  Ready to play?
                </h3>
                <p className="text-muted-foreground mb-2">
                  Click as fast as you can in 10 seconds!
                </p>
                <p className="text-sm text-muted-foreground/70 font-mono mb-6">
                  १० सेकंदात जितके शक्य तितके क्लिक करा!
                </p>
                {highScore > 0 && (
                  <p className="text-sm text-accent flex items-center justify-center gap-2 mb-6">
                    <Trophy className="w-4 h-4" />
                    High Score / उच्च गुण: {highScore}
                  </p>
                )}
                <motion.button
                  onClick={startGame}
                  className="px-8 py-4 bg-game text-game-foreground rounded-full font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                >
                  Start Game / खेळ सुरू करा
                </motion.button>
              </motion.div>
            )}

            {gameStarted && !gameOver && (
              <div className="py-6">
                {/* Stats */}
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Score / गुण</p>
                    <p className="text-3xl font-bold text-card-foreground">{score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Time / वेळ</p>
                    <p
                      className={`text-3xl font-bold ${timeLeft <= 3 ? "text-destructive" : "text-card-foreground"}`}
                    >
                      {timeLeft}s
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Combo / कॉम्बो</p>
                    <p className="text-3xl font-bold text-accent flex items-center gap-1">
                      {combo > 0 && <Zap className="w-5 h-5" />}
                      {combo}x
                    </p>
                  </div>
                </div>

                {/* Click target */}
                <motion.div
                  className="relative w-full h-48 bg-muted rounded-2xl flex items-center justify-center cursor-pointer select-none overflow-hidden active:bg-muted/80"
                  onClick={handleClick}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="text-6xl pointer-events-none"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.1 }}
                    key={score}
                  >
                    🎯
                  </motion.div>

                  {/* Floating numbers */}
                  <AnimatePresence>
                    {floatingNumbers.map((float) => (
                      <motion.div
                        key={float.id}
                        className="absolute pointer-events-none font-bold text-2xl text-game"
                        style={{ left: float.x, top: float.y }}
                        initial={{ opacity: 1, scale: 0.5, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -60 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        +{float.value}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  Tap fast! Build combos for bonus points!
                  <br />
                  <span className="font-mono">वेगाने टॅप करा! बोनस पॉइंट्ससाठी कॉम्बो बनवा!</span>
                </p>
              </div>
            )}

            {gameOver && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.h3
                  className="text-4xl font-bold mb-2"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                >
                  <span className="text-destructive">खेळ खल्लास !</span>
                  <br />
                  <span className="text-primary">GAME OVER</span>
                </motion.h3>

                <div className="my-8">
                  <p className="text-muted-foreground mb-2">Final Score / अंतिम गुण</p>
                  <motion.p
                    className="text-6xl font-bold text-card-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    {score}
                  </motion.p>
                  {score >= highScore && score > 0 && (
                    <motion.p
                      className="text-accent flex items-center justify-center gap-2 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Trophy className="w-5 h-5" />
                      New High Score! / नवीन उच्च गुण!
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={startGame}
                    className="px-6 py-3 bg-game text-game-foreground rounded-full font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    Play Again / पुन्हा खेळा
                  </motion.button>
                  <motion.button
                    onClick={handleClose}
                    className="px-6 py-3 bg-muted text-muted-foreground rounded-full font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                  >
                    Close / बंद करा
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
