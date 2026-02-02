"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react"

const facts = [
  {
    en: "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible!",
    mr: "मध कधीही खराब होत नाही. पुरातत्वशास्त्रज्ञांना इजिप्शियन थडग्यांमध्ये ३००० वर्षे जुने मध सापडले जे अजूनही खाण्यायोग्य होते!",
  },
  {
    en: "Octopuses have three hearts and blue blood!",
    mr: "ऑक्टोपसला तीन हृदये आणि निळे रक्त असते!",
  },
  {
    en: "A day on Venus is longer than a year on Venus.",
    mr: "शुक्रावरचा एक दिवस शुक्रावरच्या एका वर्षापेक्षा मोठा असतो.",
  },
  {
    en: "Bananas are berries, but strawberries aren't!",
    mr: "केळी हे बेरी आहेत, पण स्ट्रॉबेरी नाहीत!",
  },
  {
    en: "The inventor of the Pringles can is buried in one.",
    mr: "प्रिंगल्स कॅनचा शोधकर्ता त्यातच दफन आहे.",
  },
  {
    en: "Cows have best friends and get stressed when separated.",
    mr: "गायींना जवळचे मित्र असतात आणि वेगळे झाल्यावर त्यांना ताण येतो.",
  },
  {
    en: "The shortest war in history lasted 38 minutes.",
    mr: "इतिहासातील सर्वात कमी युद्ध ३८ मिनिटे चालले.",
  },
  {
    en: "A group of flamingos is called a 'flamboyance'.",
    mr: "फ्लेमिंगोच्या गटाला 'फ्लॅम्बॉयन्स' म्हणतात.",
  },
]

export function RandomFact() {
  const [factIndex, setFactIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)

  useEffect(() => {
    setFactIndex(Math.floor(Math.random() * facts.length))
  }, [])

  const getNewFact = () => {
    setIsSpinning(true)
    setTimeout(() => {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * facts.length)
      } while (newIndex === factIndex)
      setFactIndex(newIndex)
      setIsSpinning(false)
    }, 500)
  }

  const currentFact = facts[factIndex]

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground">Random Fact</h3>
                  <p className="text-xs text-muted-foreground font-mono">यादृच्छिक तथ्य</p>
                </div>
              </div>
              
              <motion.button
                onClick={getNewFact}
                className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSpinning}
              >
                <motion.div
                  animate={{ rotate: isSpinning ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span className="hidden sm:inline">New Fact</span>
              </motion.button>
            </div>

            {/* Fact content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-lg md:text-xl text-card-foreground leading-relaxed mb-4">
                  <Sparkles className="inline-block w-5 h-5 text-accent mr-2" />
                  {currentFact.en}
                </p>
                <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                  {currentFact.mr}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
