"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import type { ExperienceConfig } from "@/lib/experience-resolver";

interface PromptPainterProps {
  isFinishing: boolean;
  config: ExperienceConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
}

export default function PromptPainter({
  isFinishing,
  config,
}: PromptPainterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number; isDown: boolean }>({
    x: 0,
    y: 0,
    isDown: false,
  });
  const hueRef = useRef(0);
  const [hasPainted, setHasPainted] = useState(false);

  const syncPaintState = useCallback(() => {
    setHasPainted(particlesRef.current.length > 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "lighter";

      if (pointerRef.current.isDown && !isFinishing) {
        hueRef.current = (hueRef.current + 2) % 360;
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: pointerRef.current.x + (Math.random() - 0.5) * 10,
            y: pointerRef.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 0.5,
            life: 1,
            size: Math.random() * 8 + 4,
            hue: hueRef.current + (Math.random() - 0.5) * 40,
          });
        }
        syncPaintState();
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.fill();
      }
      if (particlesRef.current.length > 400)
        particlesRef.current.splice(0, particlesRef.current.length - 400);
      syncPaintState();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isFinishing, syncPaintState]);

  const getPointerPosition = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const position = getPointerPosition(e.clientX, e.clientY);
      if (position) pointerRef.current = { ...position, isDown: true };
    },
    [getPointerPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const position = getPointerPosition(e.clientX, e.clientY);
      if (position) {
        pointerRef.current.x = position.x;
        pointerRef.current.y = position.y;
      }
    },
    [getPointerPosition],
  );

  const handlePointerUp = useCallback(() => {
    pointerRef.current.isDown = false;
  }, []);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Prompt Painter{" "}
          {config.theme !== "general" && (
            <span className="text-purple-400 normal-case">
              ({config.theme})
            </span>
          )}
        </div>
      </div>
      <motion.div
        className="relative w-full h-48 bg-[#0a0a0f] rounded-xl border border-gray-800 overflow-hidden shadow-inner touch-none"
        animate={
          isFinishing ? { opacity: 0.5, scale: 0.98 } : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.6 }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset"
          role="application"
          aria-label="Interactive painting canvas"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        {!isFinishing && !hasPainted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-600 animate-pulse text-center px-4">
              {config.theme !== "general"
                ? `Draw something related to ${config.description}...`
                : "Draw something beautiful..."}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
