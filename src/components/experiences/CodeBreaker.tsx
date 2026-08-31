"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, CheckCircle2, XCircle, Zap } from "lucide-react";
import type { ExperienceConfig } from "@/lib/experience-resolver";

interface CodeChallenge {
  lines: string[];
  buggyLineIndex: number;
}

const REACT_CHALLENGES: CodeChallenge[] = [
  {
    lines: [
      "function Counter() {",
      "  const [count, setCount] = useState(0)",
      "  return <button>{count}</button>",
      "}",
    ],
    buggyLineIndex: 1,
  },
  {
    lines: [
      "const User = ({ name }) => {",
      "  return <h1>Hello {name}</h1>",
      "}",
      "export default User;",
    ],
    buggyLineIndex: 0,
  },
];

const PYTHON_CHALLENGES: CodeChallenge[] = [
  {
    lines: ["def greet(name):", "    print(f'Hello {name}')", "greet('World'"],
    buggyLineIndex: 2,
  },
  { lines: ["for i in range(10)", "    print(i)"], buggyLineIndex: 0 },
];

const JAVASCRIPT_CHALLENGES: CodeChallenge[] = [
  {
    lines: [
      "const arr = [1, 2, 3];",
      "arr.map(x => x * 2",
      "console.log(arr);",
    ],
    buggyLineIndex: 1,
  },
  {
    lines: ["function add(a, b) {", "  return a + b", "}", "add(1, 2"],
    buggyLineIndex: 3,
  },
];

const GENERAL_CHALLENGES: CodeChallenge[] = [
  { lines: ["if (x = 5) {", "  return true;", "}"], buggyLineIndex: 0 },
  {
    lines: [
      "const data = await fetch(url)",
      "console.log(data;",
      "return data;",
    ],
    buggyLineIndex: 1,
  },
];

interface CodeBreakerProps {
  config: ExperienceConfig;
}

export default function CodeBreaker({ config }: CodeBreakerProps) {
  const challengePool =
    config.theme === "react"
      ? REACT_CHALLENGES
      : config.theme === "python"
        ? PYTHON_CHALLENGES
        : config.theme === "javascript"
          ? JAVASCRIPT_CHALLENGES
          : GENERAL_CHALLENGES;

  const [challenge, setChallenge] = useState<CodeChallenge>(
    () => challengePool[Math.floor(Math.random() * challengePool.length)],
  );
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const isMounted = useRef(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const pickNewChallenge = useCallback(() => {
    if (!isMounted.current) return;
    const randomIndex = Math.floor(Math.random() * challengePool.length);
    setChallenge(challengePool[randomIndex]);
    setSelectedLine(null);
    setFeedback(null);
  }, [challengePool]);

  const handleLineSelect = useCallback(
    (index: number) => {
      if (feedback === "correct") return;
      setSelectedLine(index);

      if (index === challenge.buggyLineIndex) {
        setFeedback("correct");
        setScore((prev) => prev + 1);
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => {
          if (isMounted.current) pickNewChallenge();
        }, 800);
      } else {
        setFeedback("wrong");
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
        advanceTimer.current = setTimeout(() => {
          if (isMounted.current) {
            setFeedback(null);
            setSelectedLine(null);
          }
        }, 500);
      }
    },
    [feedback, challenge.buggyLineIndex, pickNewChallenge],
  );

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Bug className="w-3.5 h-3.5 text-red-400" />
          Spot the Bug{" "}
          {config.theme !== "general" && (
            <span className="text-purple-400 normal-case">
              ({config.theme})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700">
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-white">{score}</span>
        </div>
      </div>

      <motion.div
        className="bg-[#0d1117] rounded-xl border border-gray-800 overflow-hidden font-mono text-sm shadow-inner"
        animate={feedback === "wrong" ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        role="group"
        aria-label="Code editor with syntax errors"
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
              onClick={() => handleLineSelect(index)}
              tabIndex={0}
              role="button"
              aria-label={`Line ${index + 1}: ${line}`}
              className={`
                relative flex items-center px-4 py-2.5 cursor-pointer transition-colors outline-none
                border-b border-gray-800/50 last:border-0 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset
                ${isBuggy ? "bg-green-500/10 text-green-400" : ""}
                ${isWrong ? "bg-red-500/10 text-red-400" : ""}
                ${!isSelected ? "text-gray-300 hover:bg-gray-800/50" : ""}
              `}
            >
              <span className="text-gray-600 w-6 select-none text-xs">
                {index + 1}
              </span>
              <span className="flex-1 truncate">{line}</span>
              <AnimatePresence>
                {isBuggy && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {isWrong && <XCircle className="w-4 h-4 text-red-400" />}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
