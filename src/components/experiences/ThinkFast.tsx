"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, CheckCircle2, XCircle } from "lucide-react";

interface ThinkFastProps {
  isFinishing: boolean;
}

// Highly distinct emoji pairs for universal recognition
const EMOJI_PAIRS = [
  ["🍎", "🍏"],
  ["🐶", ""],
  ["🚗", "🚕"],
  ["⚽", "🏀"],
  ["🌕", ""],
  ["🔥", "💧"],
  ["🎸", "🎺"],
  ["", "🍔"],
  ["", "🌵"],
  ["", "🐦"],
  ["", "🛵"],
  ["", "🍩"],
];

interface Challenge {
  grid: string[];
  oddIndex: number;
}

export default function ThinkFast({ isFinishing }: ThinkFastProps) {
  // Generate a new 3x3 challenge
  const generateChallenge = useCallback((): Challenge => {
    const pair = EMOJI_PAIRS[Math.floor(Math.random() * EMOJI_PAIRS.length)];
    const isTargetFirst = Math.random() > 0.5;
    const target = isTargetFirst ? pair[0] : pair[1];
    const distractor = isTargetFirst ? pair[1] : pair[0];

    const grid = Array(9).fill(target);
    const oddIndex = Math.floor(Math.random() * 9);
    grid[oddIndex] = distractor;

    return { grid, oddIndex };
  }, []);

  const [challenge, setChallenge] = useState<Challenge | null>(() =>
    generateChallenge(),
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleTileClick = (index: number) => {
    if (isFinishing || !challenge || feedback === "correct") return;

    setSelectedIndex(index);

    if (index === challenge.oddIndex) {
      setFeedback("correct");
      setScore((prev) => prev + 1);

      // Auto-advance
      setTimeout(() => {
        if (!isFinishing) {
          setChallenge(generateChallenge());
          setSelectedIndex(null);
          setFeedback(null);
        }
      }, 600); // Slightly faster than Code Breaker for higher tempo
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndex(null);
      }, 400);
    }
  };

  if (!challenge) return null;

  return (
    <div className="w-full space-y-3">
      {/* Header / Score */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          Think Fast
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700">
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{score}</span>
        </div>
      </div>

      {/* 3x3 Grid Area */}
      <motion.div
        className="bg-[#0d1117] rounded-xl border border-gray-800 p-3 shadow-inner"
        animate={feedback === "wrong" ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {challenge.grid.map((emoji, index) => {
              const isSelected = selectedIndex === index;
              const isOdd = isSelected && index === challenge.oddIndex;
              const isWrong = isSelected && index !== challenge.oddIndex;

              return (
                <motion.button
                  key={`${challenge.oddIndex}-${index}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  onClick={() => handleTileClick(index)}
                  disabled={isFinishing}
                  className={`
                    relative aspect-square flex items-center justify-center 
                    text-2xl sm:text-3xl rounded-lg transition-all duration-150
                    ${isOdd ? "bg-green-500/20 ring-2 ring-green-500 scale-110" : ""}
                    ${isWrong ? "bg-red-500/20 ring-2 ring-red-500" : ""}
                    ${!isSelected ? "bg-gray-800/50 hover:bg-gray-700/50 active:scale-95" : ""}
                    ${isFinishing ? "opacity-40 pointer-events-none" : ""}
                  `}
                >
                  {emoji}

                  {/* Feedback Icons */}
                  <AnimatePresence>
                    {isOdd && (
                      <motion.div
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"
                      >
                        <CheckCircle2 className="w-3 h-3 text-black" />
                      </motion.div>
                    )}
                    {isWrong && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"
                      >
                        <XCircle className="w-3 h-3 text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Feedback Text */}
      <div className="h-5 text-center">
        <AnimatePresence mode="wait">
          {feedback === "correct" && (
            <motion.p
              key="correct"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-bold text-green-400"
            >
              ⚡ Sharp eyes! Next one...
            </motion.p>
          )}
          {feedback === "wrong" && (
            <motion.p
              key="wrong"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs font-bold text-red-400"
            >
              Look closer!
            </motion.p>
          )}
          {!feedback && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500"
            >
              Tap the emoji that doesn&apos;t belong
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
