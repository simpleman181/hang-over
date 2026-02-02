"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Trophy } from "lucide-react"

interface MemoryGameProps {
  isOpen: boolean
  onClose: () => void
}

const EMOJIS = ["🌟", "🎨", "🎵", "🌈", "🔥", "💎", "🌸", "🎯"]

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function createCards(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS]
  const shuffled = shuffleArray(pairs)
  return shuffled.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
}

export function MemoryGame({ isOpen, onClose }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isWon, setIsWon] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (isOpen) {
      resetGame()
    }
  }, [isOpen])

  const resetGame = () => {
    setCards(createCards())
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setIsWon(false)
  }

  const handleCardClick = (id: number) => {
    if (isChecking) return
    if (flippedCards.length >= 2) return
    if (cards[id].isFlipped || cards[id].isMatched) return

    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      setIsChecking(true)

      const [first, second] = newFlipped
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          )
          setMatches((m) => {
            const newMatches = m + 1
            if (newMatches === EMOJIS.length) {
              setIsWon(true)
            }
            return newMatches
          })
          setFlippedCards([])
          setIsChecking(false)
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          )
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Life in Pixels</h2>
              <p className="text-sm text-muted-foreground font-mono">पिक्सेलमधील जीवन</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{moves}</p>
              <p className="text-xs text-muted-foreground">Moves / हालचाली</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-card-foreground">{matches}/{EMOJIS.length}</p>
              <p className="text-xs text-muted-foreground">Matches / जोड्या</p>
            </div>
          </div>

          {/* Game board */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-colors ${
                  card.isFlipped || card.isMatched
                    ? "bg-primary/20"
                    : "bg-muted hover:bg-muted/80"
                } ${card.isMatched ? "opacity-50" : ""}`}
                whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  rotateY: card.isFlipped || card.isMatched ? 0 : 180,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{
                    opacity: card.isFlipped || card.isMatched ? 1 : 0,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {card.emoji}
                </motion.span>
              </motion.button>
            ))}
          </div>

          {/* Win state */}
          <AnimatePresence>
            {isWon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center mb-6 p-4 bg-primary/10 rounded-2xl"
              >
                <Trophy className="w-12 h-12 text-primary mx-auto mb-2" />
                <h3 className="text-xl font-bold text-card-foreground">
                  खेळ खल्लास ! GAME OVER
                </h3>
                <p className="text-muted-foreground">
                  You won in {moves} moves! / तुम्ही {moves} हालचालींमध्ये जिंकलात!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset button */}
          <div className="flex justify-center">
            <motion.button
              type="button"
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
              {isWon ? "Play Again / पुन्हा खेळा" : "Reset / रीसेट"}
            </motion.button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Match all the pairs! / सर्व जोड्या जुळवा!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
