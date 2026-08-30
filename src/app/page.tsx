'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThinkPlayStore } from '@/store/thinkplayStore';
import WaitingRoom from "../components/waiting-room/WaitingRoom";
import { Send, RefreshCw, Sparkles } from 'lucide-react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const { state, aiResponse, submitRequest, reset } = useThinkPlayStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state !== "IDLE") return;
    const promptToSubmit = inputValue;
    setInputValue('');
    submitRequest(promptToSubmit);
  };

  const handleNewPrompt = () => {
    reset();
    setInputValue('');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            ThinkPlay
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Your AI is thinking. Your time isn&apos;t wasted.</p>
        </div>

        <AnimatePresence mode="wait">
          {(state === "IDLE" || state === "RESPONSE_DISPLAYED") && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Try: 'Fix this React bug', 'Write a poem about space', or 'Explain quantum physics'"
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none h-32 transition-all"
                  disabled={state !== "IDLE"}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || state !== "IDLE"}
                  className="absolute bottom-4 right-4 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {state === "RESPONSE_DISPLAYED" && (
                <button
                  type="button"
                  onClick={handleNewPrompt}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded-xl transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Start New Request
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(state === "WAITING_ACTIVE" || state === "TRANSITIONING_TO_RESPONSE") && (
            <WaitingRoom key="waiting-room" />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {state === "RESPONSE_DISPLAYED" && aiResponse && (
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold text-sm uppercase tracking-wider">AI Response Ready</span>
              </div>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed font-mono text-sm sm:text-base">
                {aiResponse}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
