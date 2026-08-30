"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, CheckCircle2, XCircle, Zap } from "lucide-react";

interface CodeChallenge {
  lines: string[];
  buggyLineIndex: number;
}

// Clean, valid challenges for MVP
const MVP_CHALLENGES: CodeChallenge[] = [
  {
    lines: [
      "const data = await fetch(url)",
      "console.log(data;",
      "return data;",
    ],
    buggyLineIndex: 1,
  },
  {
    lines: ["function add(a, b) {", "  return a + b", "}", "add(1, 2"],
    buggyLineIndex: 3,
  },
  {
    lines: ["if (x = 5) {", "  return true;", "}"],
    buggyLineIndex: 0,
  },
  {
    lines: [
      "const arr = [1, 2, 3];",
      "arr.map(x => x * 2",
      "console.log(arr);",
    ],
    buggyLineIndex: 1,
  },
  {
    lines: [
      "try {",
      "  riskyOperation();",
      "catch (e) {",
      "  console.error(e);",
      "}",
    ],
    buggyLineIndex: 2,
  },
  {
    lines: ["const x = 10;", "const y = 20;", "console.log(x + y"],
    buggyLineIndex: 2,
  },
  {
    lines: ["let count = 0;", "while (count < 10) {", "  count++", "}"],
    buggyLineIndex: 2,
  },
  {
    lines: [
      "const user = {",
      '  name: "Alex",',
      "  age: 25",
      'user.name = "Sam"',
    ],
    buggyLineIndex: 3,
  },
];

interface CodeBreakerProps {
  isFinishing: boolean;
}

export default function CodeBreaker({ isFinishing }: CodeBreakerProps) {
  // Lazy initialization to avoid setState in useEffect
  const [challenge, setChallenge] = useState<CodeChallenge>(() => {
    const randomIndex = Math.floor(Math.random() * MVP_CHALLENGES.length);
    return MVP_CHALLENGES[randomIndex];
  });

  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  // Memoized function to pick new challenge
  const pickNewChallenge = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * MVP_CHALLENGES.length);
    setChallenge(MVP_CHALLENGES[randomIndex]);
    setSelectedLine(null);
    setFeedback(null);
  }, []);

  const handleLineClick = useCallback(
    (index: number) => {
      if (isFinishing || feedback === "correct") return;

      setSelectedLine(index);

      if (index === challenge.buggyLineIndex) {
        setFeedback("correct");
        setScore((prev) => prev + 1);

        // Auto-advance after success
        setTimeout(() => {
          if (!isFinishing) {
            pickNewChallenge();
          }
        }, 800);
      } else {
        setFeedback("wrong");
        setTimeout(() => {
          setFeedback(null);
          setSelectedLine(null);
        }, 500);
      }
    },
    [isFinishing, feedback, challenge.buggyLineIndex, pickNewChallenge],
  );

  return (
    <div className="w-full space-y-3">
      {/* Header / Score */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Bug className="w-3.5 h-3.5 text-red-400" />
          Spot the Bug
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700">
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{score}</span>
        </div>
      </div>

      {/* Code Editor Area */}
      <motion.div
        className="bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden font-mono text-sm shadow-inner"
        animate={feedback === "wrong" ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {challenge.lines.map((line, index) => {
          const isSelected = selectedLine === index;
          const isBuggy = isSelected && index === challenge.buggyLineIndex;
          const isWrong = isSelected && index !== challenge.buggyLineIndex;

          return (
            <motion.div
              key={`${challenge.buggyLineIndex}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleLineClick(index)}
              className={`
                relative flex items-center px-4 py-2.5 cursor-pointer transition-colors
                border-b border-gray-800/50 last:border-0
                ${isBuggy ? "bg-green-500/10 text-green-400" : ""}
                ${isWrong ? "bg-red-500/10 text-red-400" : ""}
                ${!isSelected ? "text-gray-300 hover:bg-gray-800/50" : ""}
                ${isFinishing ? "pointer-events-none opacity-50" : ""}
              `}
            >
              <span className="text-gray-600 w-6 select-none text-xs">
                {index + 1}
              </span>
              <span className="flex-1 truncate">{line}</span>

              <AnimatePresence>
                {isBuggy && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </motion.div>
                )}
                {isWrong && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
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
              🐛 Bug squashed! Next one...
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
              Not quite. Look closer!
            </motion.p>
          )}
          {!feedback && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500"
            >
              Tap the line with the syntax error
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
