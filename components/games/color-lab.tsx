"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Shuffle, Copy, Check } from "lucide-react"

interface ColorLabProps {
  isOpen: boolean
  onClose: () => void
}

function hslToHex(h: number, s: number, l: number): string {
  const hDecimal = h / 360
  const sDecimal = s / 100
  const lDecimal = l / 100

  const a = sDecimal * Math.min(lDecimal, 1 - lDecimal)
  const f = (n: number) => {
    const k = (n + hDecimal * 12) % 12
    const color = lDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, "0")
  }

  return `#${f(0)}${f(8)}${f(4)}`
}

function generatePalette(): { h: number; s: number; l: number }[] {
  const baseHue = Math.random() * 360
  const schemes = ["analogous", "complementary", "triadic", "split"]
  const scheme = schemes[Math.floor(Math.random() * schemes.length)]

  let hues: number[] = []

  switch (scheme) {
    case "analogous":
      hues = [baseHue, baseHue + 30, baseHue + 60, baseHue - 30, baseHue - 60]
      break
    case "complementary":
      hues = [baseHue, baseHue + 180, baseHue + 15, baseHue + 195, baseHue - 15]
      break
    case "triadic":
      hues = [baseHue, baseHue + 120, baseHue + 240, baseHue + 60, baseHue + 180]
      break
    case "split":
      hues = [baseHue, baseHue + 150, baseHue + 210, baseHue + 30, baseHue - 30]
      break
  }

  return hues.map((h, i) => ({
    h: ((h % 360) + 360) % 360,
    s: 60 + Math.random() * 30,
    l: i === 0 ? 45 + Math.random() * 20 : 30 + Math.random() * 40,
  }))
}

export function ColorLab({ isOpen, onClose }: ColorLabProps) {
  const [palette, setPalette] = useState<{ h: number; s: number; l: number }[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [lockedColors, setLockedColors] = useState<boolean[]>([false, false, false, false, false])

  useEffect(() => {
    if (isOpen) {
      setPalette(generatePalette())
    }
  }, [isOpen])

  const regenerate = () => {
    const newPalette = generatePalette()
    setPalette((prev) =>
      prev.map((color, i) => (lockedColors[i] ? color : newPalette[i]))
    )
  }

  const copyColor = (index: number) => {
    const color = palette[index]
    const hex = hslToHex(color.h, color.s, color.l)
    navigator.clipboard.writeText(hex)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const toggleLock = (index: number) => {
    setLockedColors((prev) => {
      const newLocked = [...prev]
      newLocked[index] = !newLocked[index]
      return newLocked
    })
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
          className="bg-card rounded-3xl p-6 max-w-3xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Color Lab</h2>
              <p className="text-sm text-muted-foreground font-mono">रंग प्रयोगशाळा</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Palette display */}
          <div className="flex rounded-2xl overflow-hidden mb-6 h-48">
            {palette.map((color, index) => {
              const hex = hslToHex(color.h, color.s, color.l)
              const isLight = color.l > 60
              return (
                <motion.div
                  key={index}
                  className="flex-1 relative group cursor-pointer"
                  style={{ backgroundColor: hex }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => copyColor(index)}
                >
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                      isLight ? "text-foreground" : "text-background"
                    }`}
                  >
                    {copiedIndex === index ? (
                      <Check className="w-6 h-6 mb-2" />
                    ) : (
                      <Copy className="w-6 h-6 mb-2" />
                    )}
                    <span className="font-mono text-sm uppercase">{hex}</span>
                  </div>
                  
                  {/* Lock indicator */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLock(index)
                    }}
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium transition-opacity ${
                      isLight ? "bg-foreground/20 text-foreground" : "bg-background/20 text-background"
                    } ${lockedColors[index] ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    {lockedColors[index] ? "Locked" : "Lock"}
                  </button>
                </motion.div>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.button
              type="button"
              onClick={regenerate}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className="w-5 h-5" />
              Generate New / नवीन बनवा
            </motion.button>
          </div>

          {/* Color values */}
          <div className="grid grid-cols-5 gap-2 mt-6">
            {palette.map((color, index) => {
              const hex = hslToHex(color.h, color.s, color.l)
              return (
                <div key={index} className="text-center">
                  <div
                    className="w-full h-8 rounded-lg mb-1"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    {hex}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Click colors to copy! Press spacebar or button to regenerate.
            <br />
            <span className="font-mono text-xs">रंग कॉपी करण्यासाठी क्लिक करा!</span>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
