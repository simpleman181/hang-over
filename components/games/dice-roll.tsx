"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiceRollProps {
  isOpen: boolean
  onClose: () => void
}

const DiceFace = ({ value }: { value: number }) => {
  const dotPositions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  }

  return (
    <div className="relative w-20 h-20 bg-card rounded-xl border-2 border-border shadow-lg">
      {dotPositions[value]?.map(([x, y], index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-foreground rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}

export function DiceRoll({ isOpen, onClose }: DiceRollProps) {
  const [dice, setDice] = useState<number[]>([1, 1])
  const [isRolling, setIsRolling] = useState(false)
  const [numDice, setNumDice] = useState(2)
  const [history, setHistory] = useState<{ dice: number[]; total: number }[]>([])

  const rollDice = () => {
    if (isRolling) return
    
    setIsRolling(true)
    
    // Animate through random values
    let iterations = 0
    const maxIterations = 10
    
    const interval = setInterval(() => {
      const newDice = Array(numDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1)
      setDice(newDice)
      iterations++
      
      if (iterations >= maxIterations) {
        clearInterval(interval)
        const finalDice = Array(numDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1)
        setDice(finalDice)
        setHistory(prev => [{ dice: finalDice, total: finalDice.reduce((a, b) => a + b, 0) }, ...prev].slice(0, 10))
        setIsRolling(false)
      }
    }, 100)
  }

  const total = dice.reduce((a, b) => a + b, 0)

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
              <h2 className="text-2xl font-bold text-card-foreground">Dice Roll</h2>
              <p className="text-sm text-muted-foreground">फासे फिरवा</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Number of dice selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Number of dice / फासांची संख्या:</span>
            {[1, 2, 3, 4].map((n) => (
              <Button
                key={n}
                variant={numDice === n ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setNumDice(n)
                  setDice(Array(n).fill(1))
                }}
                disabled={isRolling}
              >
                {n}
              </Button>
            ))}
          </div>

          {/* Dice display */}
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {dice.map((value, index) => (
              <motion.div
                key={index}
                animate={isRolling ? {
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 0.3,
                  repeat: isRolling ? Infinity : 0,
                }}
              >
                <DiceFace value={value} />
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <motion.div
            className="text-center mb-6"
            animate={isRolling ? { opacity: 0.5 } : { opacity: 1 }}
          >
            <p className="text-sm text-muted-foreground">Total / एकूण</p>
            <p className="text-5xl font-bold text-primary">{total}</p>
          </motion.div>

          {/* Roll button */}
          <Button
            onClick={rollDice}
            className="w-full mb-6"
            size="lg"
            disabled={isRolling}
          >
            <Dices className="w-5 h-5 mr-2" />
            {isRolling ? "Rolling..." : "Roll Dice / फासे फिरवा"}
          </Button>

          {/* History */}
          {history.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">History / इतिहास</p>
              <div className="flex flex-wrap gap-2">
                {history.map((roll, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-muted rounded-lg px-3 py-1 text-sm"
                  >
                    <span className="text-muted-foreground">[{roll.dice.join(", ")}]</span>
                    <span className="font-bold text-card-foreground ml-1">= {roll.total}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
