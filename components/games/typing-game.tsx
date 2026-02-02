"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trophy, RotateCcw, Keyboard } from "lucide-react"

interface TypingGameProps {
  isOpen: boolean
  onClose: () => void
}

const WORDS = [
  "code", "design", "build", "create", "learn", "grow", "play", "win",
  "fast", "slow", "jump", "run", "think", "dream", "work", "rest",
  "love", "hope", "wish", "find", "seek", "give", "take", "make",
  "type", "click", "scroll", "drag", "drop", "push", "pull", "move",
  "game", "fun", "joy", "happy", "smile", "laugh", "sing", "dance"
]

const GAME_DURATION = 30

export function TypingGame({ isOpen, onClose }: TypingGameProps) {
  const [currentWord, setCurrentWord] = useState("")
  const [typedWord, setTypedWord] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [wordsTyped, setWordsTyped] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("typingHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const getNewWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length)
    return WORDS[randomIndex]
  }, [])

  const resetGame = useCallback(() => {
    setCurrentWord(getNewWord())
    setTypedWord("")
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setGameStarted(false)
    setGameOver(false)
    setWordsTyped(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    setAccuracy(100)
  }, [getNewWord])

  useEffect(() => {
    if (isOpen && !currentWord) {
      setCurrentWord(getNewWord())
    }
  }, [isOpen, currentWord, getNewWord])

  useEffect(() => {
    if (!isOpen) {
      resetGame()
    }
  }, [isOpen, resetGame])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          if (score > highScore) {
            setHighScore(score)
            if (typeof window !== "undefined") {
              localStorage.setItem("typingHighScore", String(score))
            }
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, gameOver, score, highScore])

  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameStarted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameStarted || gameOver) return

    const value = e.target.value
    setTypedWord(value)
    setTotalKeystrokes(prev => prev + 1)

    // Check if the typed character matches
    if (value.length > 0) {
      const lastChar = value[value.length - 1]
      const expectedChar = currentWord[value.length - 1]
      if (lastChar === expectedChar) {
        setCorrectKeystrokes(prev => prev + 1)
      }
    }

    // Update accuracy
    if (totalKeystrokes > 0) {
      setAccuracy(Math.round((correctKeystrokes / totalKeystrokes) * 100))
    }

    // Check if word is complete
    if (value === currentWord) {
      setScore(prev => prev + currentWord.length * 10)
      setWordsTyped(prev => prev + 1)
      setCurrentWord(getNewWord())
      setTypedWord("")
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setCurrentWord(getNewWord())
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const getWPM = () => {
    const minutesElapsed = (GAME_DURATION - timeLeft) / 60
    if (minutesElapsed === 0) return 0
    return Math.round(wordsTyped / minutesElapsed)
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
          className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Typing Speed
              </h3>
              <p className="text-sm text-muted-foreground font-mono">टायपिंग वेग</p>
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
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Time</p>
                <p className="text-xl font-bold text-card-foreground">{timeLeft}s</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">Score</p>
                <p className="text-xl font-bold text-card-foreground">{score}</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground uppercase">WPM</p>
                <p className="text-xl font-bold text-card-foreground">{getWPM()}</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-1 justify-center">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <p className="text-xs text-muted-foreground uppercase">Best</p>
                </div>
                <p className="text-xl font-bold text-card-foreground">{highScore}</p>
              </div>
            </div>

            {/* Word display */}
            <div className="bg-secondary rounded-xl p-8 mb-4 text-center min-h-[120px] flex flex-col items-center justify-center">
              {!gameStarted && !gameOver ? (
                <button
                  type="button"
                  onClick={startGame}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
                >
                  Start Typing / टायपिंग सुरू करा
                </button>
              ) : gameOver ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <h4 className="text-2xl font-bold text-card-foreground mb-1">
                    खेळ खल्लास !
                  </h4>
                  <p className="text-lg text-muted-foreground mb-2">GAME OVER</p>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Words Typed</p>
                      <p className="font-bold text-card-foreground">{wordsTyped}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Final WPM</p>
                      <p className="font-bold text-card-foreground">{getWPM()}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetGame}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity mx-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <div className="w-full">
                  <div className="text-4xl font-mono mb-4 tracking-wider">
                    {currentWord.split("").map((char, index) => {
                      let color = "text-muted-foreground"
                      if (index < typedWord.length) {
                        color = typedWord[index] === char ? "text-green-500" : "text-red-500"
                      }
                      return (
                        <span key={index} className={color}>
                          {char}
                        </span>
                      )
                    })}
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedWord}
                    onChange={handleInputChange}
                    className="w-full max-w-xs mx-auto block px-4 py-3 bg-background border border-border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Type here..."
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Instructions */}
            <p className="text-center text-sm text-muted-foreground">
              Type as many words as you can in 30 seconds!
              <br />
              <span className="font-mono text-xs">30 सेकंदात जितके शब्द टाइप करता येतील तितके करा!</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
