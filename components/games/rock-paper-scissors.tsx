"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RPSProps {
  isOpen: boolean
  onClose: () => void
}

type Choice = "rock" | "paper" | "scissors" | null
type Result = "win" | "lose" | "draw" | null

const choices: { id: Choice; label: string; labelMarathi: string; emoji: string }[] = [
  { id: "rock", label: "Rock", labelMarathi: "दगड", emoji: "🪨" },
  { id: "paper", label: "Paper", labelMarathi: "कागद", emoji: "📄" },
  { id: "scissors", label: "Scissors", labelMarathi: "कात्री", emoji: "✂️" },
]

export function RockPaperScissors({ isOpen, onClose }: RPSProps) {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [scores, setScores] = useState({ wins: 0, losses: 0, draws: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rpsScores")
      if (saved) setScores(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (scores.wins > 0 || scores.losses > 0 || scores.draws > 0) {
      localStorage.setItem("rpsScores", JSON.stringify(scores))
    }
  }, [scores])

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "draw"
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win"
    }
    return "lose"
  }

  const play = (choice: Choice) => {
    if (isAnimating || !choice) return
    
    setIsAnimating(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)
    setCountdown(3)

    // Countdown animation
    let count = 3
    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        clearInterval(countdownInterval)
        setCountdown(null)
        
        // Computer makes choice
        const compChoice = choices[Math.floor(Math.random() * 3)].id
        setComputerChoice(compChoice)
        
        const gameResult = determineWinner(choice, compChoice)
        setResult(gameResult)
        
        setScores(s => ({
          wins: s.wins + (gameResult === "win" ? 1 : 0),
          losses: s.losses + (gameResult === "lose" ? 1 : 0),
          draws: s.draws + (gameResult === "draw" ? 1 : 0),
        }))
        
        setIsAnimating(false)
      }
    }, 500)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setCountdown(null)
  }

  const resetScores = () => {
    setScores({ wins: 0, losses: 0, draws: 0 })
    localStorage.removeItem("rpsScores")
  }

  if (!isOpen) return null

  const getResultText = () => {
    if (result === "win") return { en: "You Win!", mr: "तुम्ही जिंकलात!" }
    if (result === "lose") return { en: "You Lose!", mr: "तुम्ही हरलात!" }
    if (result === "draw") return { en: "It's a Draw!", mr: "बरोबरी!" }
    return null
  }

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
          className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Rock Paper Scissors</h2>
              <p className="text-sm text-muted-foreground">दगड कागद कात्री</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="text-sm text-green-600">Wins / जिंकणे</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.wins}</div>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="text-sm text-muted-foreground">Draws / बरोबरी</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.draws}</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-3">
              <div className="text-sm text-red-600">Losses / हरणे</div>
              <div className="text-2xl font-bold text-card-foreground">{scores.losses}</div>
            </div>
          </div>

          {/* Battle area */}
          <div className="flex items-center justify-center gap-8 mb-6 min-h-[140px]">
            {/* Player */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">You / तुम्ही</p>
              <motion.div
                className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-5xl"
                animate={countdown ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.5, repeat: countdown ? Infinity : 0 }}
              >
                {playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : "❓"}
              </motion.div>
            </div>

            {/* VS */}
            <div className="text-center">
              {countdown ? (
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-primary"
                >
                  {countdown}
                </motion.div>
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">VS</span>
              )}
            </div>

            {/* Computer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Computer / संगणक</p>
              <motion.div
                className="w-24 h-24 rounded-2xl bg-accent/10 flex items-center justify-center text-5xl"
                animate={countdown ? { rotate: [0, 10, -10, 10, -10, 0] } : {}}
                transition={{ duration: 0.5, repeat: countdown ? Infinity : 0 }}
              >
                {computerChoice ? choices.find(c => c.id === computerChoice)?.emoji : "🤖"}
              </motion.div>
            </div>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center mb-6"
              >
                <p className={`text-2xl font-bold ${
                  result === "win" ? "text-green-500" : 
                  result === "lose" ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {getResultText()?.en}
                </p>
                <p className="text-sm text-muted-foreground">{getResultText()?.mr}</p>
                <p className="text-sm text-accent mt-2">खेळ खल्लास ! GAME OVER</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choice buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {choices.map((choice) => (
              <motion.button
                key={choice.id}
                type="button"
                className={`p-4 rounded-xl border-2 transition-colors ${
                  playerChoice === choice.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-secondary"
                }`}
                onClick={() => play(choice.id)}
                disabled={isAnimating}
                whileHover={{ scale: isAnimating ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-1">{choice.emoji}</div>
                <div className="text-sm font-medium text-card-foreground">{choice.label}</div>
                <div className="text-xs text-muted-foreground">{choice.labelMarathi}</div>
              </motion.button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={resetGame} className="flex-1 bg-transparent" variant="outline" disabled={isAnimating}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again / पुन्हा खेळा
            </Button>
            <Button onClick={resetScores} variant="ghost" size="sm">
              Reset
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
