"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eraser, Trash2, Download, Palette } from "lucide-react"

interface DrawingCanvasProps {
  isOpen: boolean
  onClose: () => void
}

const colors = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899"
]

const brushSizes = [4, 8, 16, 24]

export function DrawingCanvas({ isOpen, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(8)
  const [isEraser, setIsEraser] = useState(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isOpen])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getPos(e)
    lastPosRef.current = pos
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const pos = getPos(e)
    
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = isEraser ? "#ffffff" : color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    
    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "drawing.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
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
          className="bg-card rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">Infinite Canvas</h2>
              <p className="text-sm text-muted-foreground font-mono">अमर्याद कॅनव्हास</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted rounded-xl">
              {/* Colors */}
              <div className="flex items-center gap-1">
                <Palette className="w-4 h-4 text-muted-foreground mr-1" />
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setColor(c); setIsEraser(false) }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c && !isEraser ? "scale-125 border-foreground" : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-border" />

              {/* Brush sizes */}
              <div className="flex items-center gap-2">
                {brushSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setBrushSize(size)}
                    className={`rounded-full bg-foreground transition-all ${
                      brushSize === size ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    }`}
                    style={{ width: size, height: size }}
                  />
                ))}
              </div>

              <div className="w-px h-6 bg-border" />

              {/* Tools */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEraser(!isEraser)}
                  className={`p-2 rounded-lg transition-colors ${
                    isEraser ? "bg-primary text-primary-foreground" : "hover:bg-background"
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={downloadCanvas}
                  className="p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full rounded-xl border border-border cursor-crosshair touch-none"
              style={{ aspectRatio: "3/2" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            <p className="text-center text-sm text-muted-foreground">
              Draw anything you like! / जे आवडेल ते काढा!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
