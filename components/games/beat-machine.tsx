"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Square, Volume2, VolumeX } from "lucide-react"

interface BeatMachineProps {
  isOpen: boolean
  onClose: () => void
}

const TRACKS = [
  { name: "Kick", color: "#ef4444", frequency: 150 },
  { name: "Snare", color: "#f97316", frequency: 250 },
  { name: "Hi-Hat", color: "#eab308", frequency: 800 },
  { name: "Clap", color: "#22c55e", frequency: 400 },
]

const STEPS = 16

export function BeatMachine({ isOpen, onClose }: BeatMachineProps) {
  const [grid, setGrid] = useState<boolean[][]>(
    TRACKS.map(() => Array(STEPS).fill(false))
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [isMuted, setIsMuted] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const playSound = useCallback((frequency: number, type: OscillatorType = "sine") => {
    if (isMuted || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }, [isMuted])

  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm / 4) * 1000
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          const next = (prev + 1) % STEPS
          grid.forEach((track, trackIndex) => {
            if (track[next]) {
              playSound(TRACKS[trackIndex].frequency, trackIndex === 2 ? "square" : "sine")
            }
          })
          return next
        })
      }, intervalMs)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, bpm, grid, playSound])

  const toggleCell = (trackIndex: number, stepIndex: number) => {
    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      newGrid[trackIndex][stepIndex] = !newGrid[trackIndex][stepIndex]
      return newGrid
    })
  }

  const togglePlayback = () => {
    if (!isPlaying && audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume()
    }
    setIsPlaying(!isPlaying)
    if (isPlaying) {
      setCurrentStep(0)
    }
  }

  const clearGrid = () => {
    setGrid(TRACKS.map(() => Array(STEPS).fill(false)))
    setIsPlaying(false)
    setCurrentStep(0)
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
          className="bg-card rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Beat Machine</h2>
              <p className="text-sm text-muted-foreground font-mono">बीट मशीन</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? "Stop / थांबा" : "Play / खेळा"}
            </button>

            <button
              type="button"
              onClick={clearGrid}
              className="px-4 py-3 bg-muted text-muted-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              Clear / साफ करा
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">BPM:</span>
              <input
                type="range"
                min={60}
                max={200}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-24 accent-primary"
              />
              <span className="text-sm font-mono w-8">{bpm}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="space-y-2 overflow-x-auto">
            {TRACKS.map((track, trackIndex) => (
              <div key={track.name} className="flex items-center gap-2">
                <div
                  className="w-16 text-xs font-medium shrink-0 truncate"
                  style={{ color: track.color }}
                >
                  {track.name}
                </div>
                <div className="flex gap-1">
                  {grid[trackIndex].map((isActive, stepIndex) => (
                    <motion.button
                      key={stepIndex}
                      type="button"
                      onClick={() => toggleCell(trackIndex, stepIndex)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 transition-colors ${
                        stepIndex % 4 === 0 ? "border-border/50" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: isActive ? track.color : "var(--muted)",
                        opacity: currentStep === stepIndex && isPlaying ? 1 : isActive ? 0.8 : 0.3,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: currentStep === stepIndex && isPlaying ? 1.1 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 mt-4 ml-18">
            <div className="w-16 shrink-0" />
            {Array(STEPS).fill(0).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 sm:w-10 rounded-full transition-colors ${
                  currentStep === i && isPlaying ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Click cells to add beats, then press Play! / सेल क्लिक करा बीट जोडण्यासाठी!
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
