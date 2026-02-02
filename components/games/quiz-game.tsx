"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuizGameProps {
  isOpen: boolean
  onClose: () => void
}

interface Question {
  question: string
  questionMarathi: string
  options: string[]
  correct: number
}

const questions: Question[] = [
  {
    question: "What is the capital of India?",
    questionMarathi: "भारताची राजधानी कोणती?",
    options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    correct: 1,
  },
  {
    question: "Which planet is known as the Red Planet?",
    questionMarathi: "कोणत्या ग्रहाला लाल ग्रह म्हणतात?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct: 1,
  },
  {
    question: "How many continents are there?",
    questionMarathi: "किती खंड आहेत?",
    options: ["5", "6", "7", "8"],
    correct: 2,
  },
  {
    question: "What is the largest ocean?",
    questionMarathi: "सर्वात मोठा महासागर कोणता?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correct: 3,
  },
  {
    question: "Who painted the Mona Lisa?",
    questionMarathi: "मोना लिसा कोणी रंगवली?",
    options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
    correct: 2,
  },
  {
    question: "What is H2O commonly known as?",
    questionMarathi: "H2O ला सामान्यतः काय म्हणतात?",
    options: ["Salt", "Water", "Oxygen", "Hydrogen"],
    correct: 1,
  },
  {
    question: "Which country is known as the Land of the Rising Sun?",
    questionMarathi: "कोणत्या देशाला उगवत्या सूर्याचा देश म्हणतात?",
    options: ["China", "Japan", "Korea", "Thailand"],
    correct: 1,
  },
  {
    question: "How many sides does a hexagon have?",
    questionMarathi: "षटकोनाला किती बाजू असतात?",
    options: ["5", "6", "7", "8"],
    correct: 1,
  },
  {
    question: "What is the fastest land animal?",
    questionMarathi: "जमिनीवरील सर्वात वेगवान प्राणी कोणता?",
    options: ["Lion", "Cheetah", "Horse", "Deer"],
    correct: 1,
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    questionMarathi: "वनस्पती वातावरणातून कोणता वायू शोषून घेतात?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
  },
]

export function QuizGame({ isOpen, onClose }: QuizGameProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([])
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quizHighScore")
      if (saved) setHighScore(Number(saved))
    }
  }, [])

  const startGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 5)
    setShuffledQuestions(shuffled)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setGameOver(false)
    setGameStarted(true)
  }

  const handleAnswer = (index: number) => {
    if (showResult) return
    
    setSelectedAnswer(index)
    setShowResult(true)

    if (index === shuffledQuestions[currentQuestion].correct) {
      setScore((prev) => prev + 1)
    }

    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        const finalScore = index === shuffledQuestions[currentQuestion].correct ? score + 1 : score
        if (finalScore > highScore) {
          setHighScore(finalScore)
          if (typeof window !== "undefined") {
            localStorage.setItem("quizHighScore", String(finalScore))
          }
        }
        setGameOver(true)
      }
    }, 1500)
  }

  if (!isOpen) return null

  const question = shuffledQuestions[currentQuestion]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quiz / प्रश्नमंजुषा</h2>
            <Button variant="ghost" size="icon" onClick={onClose} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!gameStarted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">Quiz Game / प्रश्नमंजुषा</h3>
              <p className="text-muted-foreground mb-2">
                Test your knowledge with 5 questions!
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                5 प्रश्नांसह तुमचे ज्ञान तपासा!
              </p>
              {highScore > 0 && (
                <p className="text-sm text-primary mb-4">High Score: {highScore}/5</p>
              )}
              <Button onClick={startGame} size="lg" type="button">
                <Play className="w-5 h-5 mr-2" />
                Start Quiz / प्रश्नमंजुषा सुरू करा
              </Button>
            </div>
          ) : gameOver ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl sm:text-5xl font-bold text-destructive mb-4"
              >
                खेळ खल्लास !
                <br />
                GAME OVER
              </motion.div>
              <div className="text-6xl mb-4">
                {score >= 4 ? "🏆" : score >= 2 ? "👍" : "😢"}
              </div>
              <p className="text-2xl font-bold mb-2">
                Score: {score} / {shuffledQuestions.length}
              </p>
              <p className="text-muted-foreground mb-4">
                {score >= 4
                  ? "Excellent! / उत्कृष्ट!"
                  : score >= 2
                  ? "Good job! / चांगले काम!"
                  : "Keep practicing! / सराव करत राहा!"}
              </p>
              {score >= highScore && score > 0 && (
                <p className="text-primary font-bold mb-4">New High Score! / नवीन उच्च गुण!</p>
              )}
              <Button onClick={startGame} type="button">
                Play Again / पुन्हा खेळा
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {shuffledQuestions.length}
                </span>
                <span className="text-sm font-bold text-primary">Score: {score}</span>
              </div>

              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">{question.question}</h3>
                <p className="text-sm text-muted-foreground">{question.questionMarathi}</p>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    type="button"
                    className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between ${
                      showResult
                        ? index === question.correct
                          ? "bg-green-500/20 border-green-500 border-2"
                          : index === selectedAnswer
                          ? "bg-red-500/20 border-red-500 border-2"
                          : "bg-secondary/50 border border-border"
                        : "bg-secondary/50 border border-border hover:bg-secondary"
                    }`}
                  >
                    <span>{option}</span>
                    {showResult && index === question.correct && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correct && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
