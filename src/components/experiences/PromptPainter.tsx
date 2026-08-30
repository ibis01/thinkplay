"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";

interface PromptPainterProps {
  isFinishing: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export default function PromptPainter({ isFinishing }: PromptPainterProps) {
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
    const nextHasPainted = particlesRef.current.length > 0;
    setHasPainted((previous) =>
      previous === nextHasPainted ? previous : nextHasPainted,
    );
  }, []);

  // Initialize and handle canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Handle resizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas with slight fade for trail effect
      ctx.clearRect(0, 0, width, height);

      // Additive blending for glowing effect
      ctx.globalCompositeOperation = "lighter";

      // Spawn particles if pointer is active and not finishing
      if (pointerRef.current.isDown && !isFinishing) {
        hueRef.current = (hueRef.current + 2) % 360;
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push({
            x: pointerRef.current.x + (Math.random() - 0.5) * 10,
            y: pointerRef.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 0.5, // Slight upward drift
            life: 1,
            maxLife: 1,
            size: Math.random() * 8 + 4,
            hue: hueRef.current + (Math.random() - 0.5) * 40,
          });
        }
        syncPaintState();
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015; // Fade rate

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = p.life;
        const currentSize = p.size * p.life;

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
        ctx.fill();
      }

      // Cap max particles for performance
      if (particlesRef.current.length > 400) {
        particlesRef.current.splice(0, particlesRef.current.length - 400);
      }

      syncPaintState();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isFinishing, syncPaintState]);

  // Pointer and touch handlers
  const getPointerPosition = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const position = getPointerPosition(e.clientX, e.clientY);
      if (!position) return;

      pointerRef.current = {
        ...position,
        isDown: true,
      };
    },
    [getPointerPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const position = getPointerPosition(e.clientX, e.clientY);
      if (!position) return;

      pointerRef.current.x = position.x;
      pointerRef.current.y = position.y;
    },
    [getPointerPosition],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;

      const position = getPointerPosition(touch.clientX, touch.clientY);
      if (!position) return;

      pointerRef.current = {
        ...position,
        isDown: true,
      };
    },
    [getPointerPosition],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;

      const position = getPointerPosition(touch.clientX, touch.clientY);
      if (!position) return;

      pointerRef.current.x = position.x;
      pointerRef.current.y = position.y;
    },
    [getPointerPosition],
  );

  const handlePointerUp = useCallback(() => {
    pointerRef.current.isDown = false;
  }, []);

  const handleTouchEnd = useCallback(() => {
    pointerRef.current.isDown = false;
  }, []);

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Prompt Painter
        </div>
        <div className="text-xs text-gray-500">
          {isFinishing ? "Finalizing..." : "Touch & drag to paint"}
        </div>
      </div>

      {/* Canvas Area */}
      <motion.div
        className="relative w-full h-48 bg-[#0a0a0f] rounded-xl border border-gray-800 overflow-hidden touch-none shadow-inner"
        animate={
          isFinishing ? { opacity: 0.5, scale: 0.98 } : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.6 }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Empty state hint */}
        {!isFinishing && !hasPainted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-gray-600 animate-pulse">
              Draw something beautiful...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
