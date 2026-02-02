"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProjectCard } from "./project-card"
import { ClickerGame } from "./clicker-game"
import { DrawingCanvas } from "./games/drawing-canvas"
import { BeatMachine } from "./games/beat-machine"
import { ColorLab } from "./games/color-lab"
import { MemoryGame } from "./games/memory-game"
import { ReactionGame } from "./games/reaction-game"
import { SnakeGame } from "./games/snake-game"
import { TypingGame } from "./games/typing-game"
import { WhackMole } from "./games/whack-mole"
import { PuzzleGame } from "./games/puzzle-game"
import { TicTacToe } from "./games/tic-tac-toe"
import { RockPaperScissors } from "./games/rock-paper-scissors"
import { Game2048 } from "./games/game-2048"
import { ConnectFour } from "./games/connect-four"
import { HangmanGame } from "./games/hangman-game"
import { SimonSays } from "./games/simon-says"
import { Minesweeper } from "./games/minesweeper"
import { BreakoutGame } from "./games/breakout-game"
import { DiceRoll } from "./games/dice-roll"
import { 
  Gamepad2, 
  PenTool, 
  Music, 
  Camera, 
  Sparkles,
  Palette,
  Bug,
  Keyboard,
  Target,
  Puzzle,
  Grid3X3,
  Hand,
  Hash,
  Circle,
  BookOpen,
  Lightbulb,
  Bomb,
  Boxes,
  Dices
} from "lucide-react"

type GameType = "clicker" | "drawing" | "beat" | "color" | "memory" | "reaction" | "snake" | "typing" | "whack" | "puzzle" | "tictactoe" | "rps" | "game2048" | "connect4" | "hangman" | "simon" | "minesweeper" | "breakout" | "dice" | null

const projects = [
  {
    title: "The Internet Game",
    titleMarathi: "इंटरनेट खेळ",
    description: "An addictive clicker game to test your speed. Can you beat the high score?",
    descriptionMarathi: "तुमचा वेग तपासण्यासाठी एक व्यसनाधीन क्लिकर गेम.",
    color: "#22c55e",
    icon: <Gamepad2 className="w-8 h-8" />,
    interactive: true,
    gameType: "clicker" as GameType,
  },
  {
    title: "Snake Game",
    titleMarathi: "साप खेळ",
    description: "The classic snake game! Eat food, grow longer, don't hit the walls.",
    descriptionMarathi: "क्लासिक साप खेळ! अन्न खा, मोठे व्हा, भिंतींना धडकू नका.",
    color: "#10b981",
    icon: <Bug className="w-8 h-8" />,
    interactive: true,
    gameType: "snake" as GameType,
  },
  {
    title: "Infinite Canvas",
    titleMarathi: "अमर्याद कॅनव्हास",
    description: "A drawing space where creativity has no limits. Draw freely!",
    descriptionMarathi: "एक ड्रॉइंग स्पेस जिथे सर्जनशीलतेला मर्यादा नाही.",
    color: "#f97316",
    icon: <PenTool className="w-8 h-8" />,
    interactive: true,
    gameType: "drawing" as GameType,
  },
  {
    title: "Beat Machine",
    titleMarathi: "बीट मशीन",
    description: "Create music loops and beats right in your browser.",
    descriptionMarathi: "तुमच्या ब्राउझरमध्येच संगीत लूप आणि बीट्स तयार करा.",
    color: "#ec4899",
    icon: <Music className="w-8 h-8" />,
    interactive: true,
    gameType: "beat" as GameType,
  },
  {
    title: "Typing Speed",
    titleMarathi: "टायपिंग वेग",
    description: "Test your typing speed! How many words can you type in 30 seconds?",
    descriptionMarathi: "तुमचा टायपिंग वेग तपासा! 30 सेकंदात किती शब्द टाइप करू शकता?",
    color: "#6366f1",
    icon: <Keyboard className="w-8 h-8" />,
    interactive: true,
    gameType: "typing" as GameType,
  },
  {
    title: "Whack-a-Mole",
    titleMarathi: "छछुंदर मारा",
    description: "Whack the moles before they hide! Test your reflexes.",
    descriptionMarathi: "छछुंदर लपण्यापूर्वी त्यांना मारा! तुमच्या प्रतिक्षिप्त क्रियांची चाचणी करा.",
    color: "#d97706",
    icon: <Target className="w-8 h-8" />,
    interactive: true,
    gameType: "whack" as GameType,
  },
  {
    title: "Life in Pixels",
    titleMarathi: "पिक्सेलमधील जीवन",
    description: "A memory matching game. Find all the pairs!",
    descriptionMarathi: "एक मेमरी जुळणारा खेळ. सर्व जोड्या शोधा!",
    color: "#14b8a6",
    icon: <Camera className="w-8 h-8" />,
    interactive: true,
    gameType: "memory" as GameType,
  },
  {
    title: "Slide Puzzle",
    titleMarathi: "स्लाइड पझल",
    description: "Arrange the numbers in order by sliding tiles. A classic brain teaser!",
    descriptionMarathi: "टाइल्स सरकवून क्रमांक क्रमाने लावा. एक क्लासिक मेंदू व्यायाम!",
    color: "#8b5cf6",
    icon: <Puzzle className="w-8 h-8" />,
    interactive: true,
    gameType: "puzzle" as GameType,
  },
  {
    title: "Color Lab",
    titleMarathi: "रंग प्रयोगशाळा",
    description: "Generate and discover beautiful color palettes.",
    descriptionMarathi: "सुंदर रंग संयोजन तयार करा आणि शोधा.",
    color: "#f43f5e",
    icon: <Palette className="w-8 h-8" />,
    interactive: true,
    gameType: "color" as GameType,
  },
  {
    title: "Daily Wonder",
    titleMarathi: "दैनिक आश्चर्य",
    description: "Test your reaction speed! How fast can you click?",
    descriptionMarathi: "तुमचा प्रतिक्रिया वेग तपासा!",
    color: "#eab308",
    icon: <Sparkles className="w-8 h-8" />,
    interactive: true,
    gameType: "reaction" as GameType,
  },
  {
    title: "Tic Tac Toe",
    titleMarathi: "टिक टॅक टो",
    description: "Classic X and O game. Play against AI or a friend!",
    descriptionMarathi: "क्लासिक X आणि O खेळ. AI किंवा मित्राविरुद्ध खेळा!",
    color: "#3b82f6",
    icon: <Grid3X3 className="w-8 h-8" />,
    interactive: true,
    gameType: "tictactoe" as GameType,
  },
  {
    title: "Rock Paper Scissors",
    titleMarathi: "दगड कागद कात्री",
    description: "The classic hand game against the computer!",
    descriptionMarathi: "संगणकाविरुद्ध क्लासिक हात खेळ!",
    color: "#a855f7",
    icon: <Hand className="w-8 h-8" />,
    interactive: true,
    gameType: "rps" as GameType,
  },
  {
    title: "2048",
    titleMarathi: "२०४८",
    description: "Slide tiles to combine numbers and reach 2048!",
    descriptionMarathi: "टाइल्स सरकवा, संख्या जोडा आणि 2048 गाठा!",
    color: "#f59e0b",
    icon: <Hash className="w-8 h-8" />,
    interactive: true,
    gameType: "game2048" as GameType,
  },
  {
    title: "Connect Four",
    titleMarathi: "चार जोडा",
    description: "Drop discs to connect four in a row!",
    descriptionMarathi: "एका रांगेत चार जोडण्यासाठी डिस्क टाका!",
    color: "#ef4444",
    icon: <Circle className="w-8 h-8" />,
    interactive: true,
    gameType: "connect4" as GameType,
  },
  {
    title: "Hangman",
    titleMarathi: "फाशीवरचा माणूस",
    description: "Guess the word before the man is hanged!",
    descriptionMarathi: "माणूस फाशीवर जाण्यापूर्वी शब्द ओळखा!",
    color: "#64748b",
    icon: <BookOpen className="w-8 h-8" />,
    interactive: true,
    gameType: "hangman" as GameType,
  },
  {
    title: "Simon Says",
    titleMarathi: "सायमन म्हणतो",
    description: "Remember and repeat the color sequence!",
    descriptionMarathi: "रंगांचा क्रम लक्षात ठेवा आणि पुन्हा करा!",
    color: "#06b6d4",
    icon: <Lightbulb className="w-8 h-8" />,
    interactive: true,
    gameType: "simon" as GameType,
  },
  {
    title: "Minesweeper",
    titleMarathi: "सुरुंग शोधक",
    description: "Clear the board without hitting any mines!",
    descriptionMarathi: "कोणत्याही सुरुंगाला न धडकता बोर्ड साफ करा!",
    color: "#71717a",
    icon: <Bomb className="w-8 h-8" />,
    interactive: true,
    gameType: "minesweeper" as GameType,
  },
  {
    title: "Breakout",
    titleMarathi: "विटा तोडा",
    description: "Break all the bricks with the bouncing ball!",
    descriptionMarathi: "उसळणाऱ्या चेंडूने सर्व विटा तोडा!",
    color: "#1e3a8a",
    icon: <Boxes className="w-8 h-8" />,
    interactive: true,
    gameType: "breakout" as GameType,
  },
  {
    title: "Dice Roll",
    titleMarathi: "फासे फिरवा",
    description: "Roll the dice and test your luck!",
    descriptionMarathi: "फासे फिरवा आणि तुमचे नशीब तपासा!",
    color: "#be185d",
    icon: <Dices className="w-8 h-8" />,
    interactive: true,
    gameType: "dice" as GameType,
  },
]

export function ProjectsSection() {
  const [activeGame, setActiveGame] = useState<GameType>(null)

  const openGame = (gameType: GameType) => {
    setActiveGame(gameType)
  }

  const closeGame = () => {
    setActiveGame(null)
  }

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Things I Made
          </h2>
          <p className="text-lg text-muted-foreground font-mono">
            मी बनवलेल्या गोष्टी
          </p>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            A collection of experiments, games, and interactive experiences.
            <br />
            <span className="text-sm opacity-70">
              प्रयोग, खेळ आणि परस्परसंवादी अनुभवांचा संग्रह।
            </span>
          </p>
        </motion.div>

        {/* Projects grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ProjectCard
                {...project}
                onInteract={project.interactive ? () => openGame(project.gameType) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Game modals */}
      <ClickerGame isOpen={activeGame === "clicker"} onClose={closeGame} />
      <DrawingCanvas isOpen={activeGame === "drawing"} onClose={closeGame} />
      <BeatMachine isOpen={activeGame === "beat"} onClose={closeGame} />
      <ColorLab isOpen={activeGame === "color"} onClose={closeGame} />
      <MemoryGame isOpen={activeGame === "memory"} onClose={closeGame} />
      <ReactionGame isOpen={activeGame === "reaction"} onClose={closeGame} />
      <SnakeGame isOpen={activeGame === "snake"} onClose={closeGame} />
      <TypingGame isOpen={activeGame === "typing"} onClose={closeGame} />
      <WhackMole isOpen={activeGame === "whack"} onClose={closeGame} />
      <PuzzleGame isOpen={activeGame === "puzzle"} onClose={closeGame} />
      <TicTacToe isOpen={activeGame === "tictactoe"} onClose={closeGame} />
      <RockPaperScissors isOpen={activeGame === "rps"} onClose={closeGame} />
      <Game2048 isOpen={activeGame === "game2048"} onClose={closeGame} />
      <ConnectFour isOpen={activeGame === "connect4"} onClose={closeGame} />
      <HangmanGame isOpen={activeGame === "hangman"} onClose={closeGame} />
      <SimonSays isOpen={activeGame === "simon"} onClose={closeGame} />
      <Minesweeper isOpen={activeGame === "minesweeper"} onClose={closeGame} />
      <BreakoutGame isOpen={activeGame === "breakout"} onClose={closeGame} />
      <DiceRoll isOpen={activeGame === "dice"} onClose={closeGame} />
    </section>
  )
}
