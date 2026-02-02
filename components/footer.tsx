"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo/Name */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-xl font-bold text-foreground">खेळ खल्लास !</span>
            <span className="text-xl font-bold text-primary">GAME OVER</span>
          </motion.div>

          {/* Credits */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              <Heart className="w-4 h-4 text-destructive inline" />
            </motion.span>
            <span>and curiosity</span>
          </div>

          {/* Year */}
          <div className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} • सर्व हक्क राखीव
          </div>
        </div>
      </div>
    </footer>
  )
}
