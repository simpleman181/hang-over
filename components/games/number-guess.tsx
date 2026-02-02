"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, ArrowUp, ArrowDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NumberGuessProps {
  isOpen: boolean
  onClose: () => void
}

export function NumberGuess({ isOpen, onClose }: NumberGuessProps) {
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts] = useState(10)
  const [hint, setHint] = useState<"higher" | "lower" | "correct" | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [guessHistory, setGuessHistory] = useState<{ guess: number; hint: "higher" | "lower" }[]>([])
  const [bestScore, setBestScore] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("numberGuessBest")
      if (saved) setBestScore(Number(saved))
    }
  }, [])

  const startGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1
    setTargetNumber(newTarget)
    setGuess("")
    setAttempts(0)
    setHint(null)
    setGameOver(false)
    setWon(false)
    setGuessHistory([])
    setGameStarted(true)
  }

  const handleGuess = () => {
    const guessNum = parseInt(guess)
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) return

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guessNum === targetNumber) {
      setHint("correct")
      setWon(true)
      setGameOver(true)
      if (bestScore === null || newAttempts < bestScore) {
        setBestScore(newAttempts)
        if (typeof window !== "undefined") {
          localStorage.setItem("numberGuessBest", String(newAttempts))
        }
      }
    } else if (guessNum < targetNumber) {
      setHint("higher")
      setGuessHistory([...guessHistory, { guess: guessNum, hint: "higher" }])
    } else {
      setHint("lower")
      setGuessHistory([...guessHistory, { guess: guessNum, hint: "lower" }])
    }

    if (newAttempts >= maxAttempts && guessNum !== targetNumber) {
      setGameOver(true)
    }

    setGuess("")
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Number Guess / अंक ओळखा</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔢</div>
              <h3 className="text-xl font-bold mb-2">Number Guessing Game</h3>
              <p className="text-muted-foreground mb-2">
                Guess a number between 1 and 100!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                1 ते 100 मधील अंक ओळखा!
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                You have {maxAttempts} attempts / तुमच्याकडे {maxAttempts} प्रयत्न आहेत
              </p>
              {bestScore && (
                <p className="text-sm text-primary mb-4">Best: {bestScore} attempts</p>
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
              <div className="text-6xl mb-4">{won ? "🎉" : "😢"}</div>
              <p className="text-2xl font-bold mb-2">
                {won ? "You Won! / तुम्ही जिंकलात!" : "You Lost! / तुम्ही हरलात!"}
              </p>
              <p className="text-muted-foreground mb-2">
                The number was: {targetNumber}
              </p>
              <p className="text-muted-foreground mb-4">
                Attempts: {attempts} / {maxAttempts}
              </p>
              {won && bestScore === attempts && (
                <p className="text-primary font-bold mb-4">New Best Score! / नवीन सर्वोत्तम!</p>
              )}
              <Button onClick={startGame} type="button">
                Play Again / पुन्हा खेळा
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Attempts: {attempts} / {maxAttempts}
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(attempts / maxAttempts) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter 1-100"
                  className="text-center text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                />
                <Button onClick={handleGuess} type="button">
                  <Check className="w-5 h-5" />
                </Button>
              </div>

              {hint && hint !== "correct" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-center p-4 rounded-lg ${
                    hint === "higher" ? "bg-blue-500/20 text-blue-500" : "bg-orange-500/20 text-orange-500"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-xl font-bold">
                    {hint === "higher" ? (
                      <>
                        <ArrowUp className="w-6 h-6" />
                        Go Higher! / वर जा!
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-6 h-6" />
                        Go Lower! / खाली या!
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {guessHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Previous guesses:</p>
                  <div className="flex flex-wrap gap-2">
                    {guessHistory.map((item, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.hint === "higher"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-orange-500/20 text-orange-500"
                        }`}
                      >
                        {item.guess} {item.hint === "higher" ? "↑" : "↓"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
