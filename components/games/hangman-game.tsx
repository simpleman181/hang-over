"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HangmanProps {
  isOpen: boolean
  onClose: () => void
}

const WORDS = [
  { word: "JAVASCRIPT", hint: "Programming language / प्रोग्रामिंग भाषा" },
  { word: "COMPUTER", hint: "Electronic device / इलेक्ट्रॉनिक उपकरण" },
  { word: "RAINBOW", hint: "Colorful arc in sky / आकाशातील रंगीत कमान" },
  { word: "ELEPHANT", hint: "Large animal / मोठा प्राणी" },
  { word: "BUTTERFLY", hint: "Flying insect / उडणारा किडा" },
  { word: "MOUNTAIN", hint: "High landform / उंच भूरूप" },
  { word: "KEYBOARD", hint: "Input device / इनपुट डिव्हाइस" },
  { word: "SUNSHINE", hint: "Light from sun / सूर्यप्रकाश" },
  { word: "CHOCOLATE", hint: "Sweet food / गोड अन्न" },
  { word: "TELEPHONE", hint: "Communication device / संवाद साधन" },
]

const MAX_WRONG = 6

export function HangmanGame({ isOpen, onClose }: HangmanProps) {
  const [wordData, setWordData] = useState(WORDS[0])
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [stats, setStats] = useState({ wins: 0, losses: 0 })

  const initGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWordData(randomWord)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameStatus("playing")
  }, [])

  useEffect(() => {
    if (isOpen) {
      initGame()
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hangmanStats")
        if (saved) setStats(JSON.parse(saved))
      }
    }
  }, [isOpen, initGame])

  useEffect(() => {
    if (stats.wins > 0 || stats.losses > 0) {
      localStorage.setItem("hangmanStats", JSON.stringify(stats))
    }
  }, [stats])

  const guessLetter = useCallback((letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.has(letter)) return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (!wordData.word.includes(letter)) {
      const newWrong = wrongGuesses + 1
      setWrongGuesses(newWrong)
      if (newWrong >= MAX_WRONG) {
        setGameStatus("lost")
        setStats(s => ({ ...s, losses: s.losses + 1 }))
      }
    } else {
      // Check if won
      const won = wordData.word.split("").every(l => newGuessed.has(l))
      if (won) {
        setGameStatus("won")
        setStats(s => ({ ...s, wins: s.wins + 1 }))
      }
    }
  }, [gameStatus, guessedLetters, wordData.word, wrongGuesses])

  useEffect(() => {
    if (!isOpen || gameStatus !== "playing") return

    const handleKeyDown = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase()
      if (/^[A-Z]$/.test(letter)) {
        guessLetter(letter)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, gameStatus, guessLetter])

  if (!isOpen) return null

  const displayWord = wordData.word
    .split("")
    .map(letter => (guessedLetters.has(letter) ? letter : "_"))
    .join(" ")

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

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
          className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Hangman</h2>
              <p className="text-sm text-muted-foreground">फाशीवरचा माणूस</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-500/10 rounded-lg p-2 text-center">
              <div className="text-sm text-muted-foreground">Wins / जिंकणे</div>
              <div className="text-xl font-bold text-green-600">{stats.wins}</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <div className="text-sm text-muted-foreground">Losses / हरणे</div>
              <div className="text-xl font-bold text-red-600">{stats.losses}</div>
            </div>
          </div>

          {/* Hangman drawing */}
          <div className="flex justify-center mb-4">
            <svg width="150" height="150" className="text-card-foreground">
              {/* Base */}
              <line x1="20" y1="140" x2="100" y2="140" stroke="currentColor" strokeWidth="3" />
              {/* Pole */}
              <line x1="60" y1="140" x2="60" y2="20" stroke="currentColor" strokeWidth="3" />
              {/* Top */}
              <line x1="60" y1="20" x2="110" y2="20" stroke="currentColor" strokeWidth="3" />
              {/* Rope */}
              <line x1="110" y1="20" x2="110" y2="35" stroke="currentColor" strokeWidth="3" />
              
              {/* Head */}
              {wrongGuesses >= 1 && (
                <circle cx="110" cy="50" r="15" stroke="currentColor" strokeWidth="3" fill="none" />
              )}
              {/* Body */}
              {wrongGuesses >= 2 && (
                <line x1="110" y1="65" x2="110" y2="100" stroke="currentColor" strokeWidth="3" />
              )}
              {/* Left arm */}
              {wrongGuesses >= 3 && (
                <line x1="110" y1="75" x2="90" y2="90" stroke="currentColor" strokeWidth="3" />
              )}
              {/* Right arm */}
              {wrongGuesses >= 4 && (
                <line x1="110" y1="75" x2="130" y2="90" stroke="currentColor" strokeWidth="3" />
              )}
              {/* Left leg */}
              {wrongGuesses >= 5 && (
                <line x1="110" y1="100" x2="90" y2="125" stroke="currentColor" strokeWidth="3" />
              )}
              {/* Right leg */}
              {wrongGuesses >= 6 && (
                <line x1="110" y1="100" x2="130" y2="125" stroke="currentColor" strokeWidth="3" />
              )}
            </svg>
          </div>

          {/* Wrong guesses counter */}
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Wrong guesses / चुकीचे अंदाज: <span className="font-bold text-red-500">{wrongGuesses}</span> / {MAX_WRONG}
            </p>
          </div>

          {/* Hint */}
          <div className="bg-muted rounded-lg p-3 mb-4 text-center">
            <p className="text-sm text-muted-foreground">Hint / संकेत:</p>
            <p className="font-medium text-card-foreground">{wordData.hint}</p>
          </div>

          {/* Word display */}
          <div className="text-center mb-6">
            <p className="text-3xl font-mono font-bold tracking-widest text-card-foreground">
              {displayWord}
            </p>
          </div>

          {/* Game result */}
          {gameStatus !== "playing" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-4 py-3 rounded-lg bg-secondary"
            >
              {gameStatus === "won" ? (
                <>
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-600">You Won! तुम्ही जिंकलात!</p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-red-600">Game Over!</p>
                  <p className="text-muted-foreground">The word was: <span className="font-bold">{wordData.word}</span></p>
                </>
              )}
              <p className="text-sm text-accent mt-2">खेळ खल्लास ! GAME OVER</p>
            </motion.div>
          )}

          {/* Keyboard */}
          <div className="grid grid-cols-9 gap-1 mb-4">
            {alphabet.map(letter => {
              const isGuessed = guessedLetters.has(letter)
              const isCorrect = isGuessed && wordData.word.includes(letter)
              const isWrong = isGuessed && !wordData.word.includes(letter)
              
              return (
                <motion.button
                  key={letter}
                  type="button"
                  className={`p-2 rounded text-sm font-bold transition-colors
                    ${isCorrect ? "bg-green-500 text-white" : ""}
                    ${isWrong ? "bg-red-500/30 text-red-500" : ""}
                    ${!isGuessed ? "bg-secondary hover:bg-primary hover:text-primary-foreground" : ""}
                    ${isGuessed ? "cursor-not-allowed" : ""}`}
                  onClick={() => guessLetter(letter)}
                  disabled={isGuessed || gameStatus !== "playing"}
                  whileHover={{ scale: isGuessed ? 1 : 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {letter}
                </motion.button>
              )
            })}
          </div>

          <Button onClick={initGame} className="w-full bg-transparent" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Word / नवीन शब्द
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
