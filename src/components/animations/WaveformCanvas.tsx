import React, { useEffect, useRef } from "react";

interface WaveformCanvasProps {
  className?: string;
  lineCount?: number;
  interactive?: boolean;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  className = "w-full h-full",
  lineCount = 48,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.targetX = Math.max(0, Math.min(1, x));
      mouseRef.current.targetY = Math.max(0, Math.min(1, y));
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      time += 0.02;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const centerY = height * 0.5;
      const step = width / lineCount;

      for (let i = 0; i < lineCount; i++) {
        const x = i * step + step * 0.5;
        const normX = i / lineCount;

        // Distance to mouse factor
        const distFromMouse = Math.abs(normX - mouseRef.current.x);
        const mouseInfluence = Math.max(0, 1 - distFromMouse * 2.5);

        // Sinusoidal waves with frequency harmonics
        const wave1 = Math.sin(time + normX * 8) * 22;
        const wave2 = Math.cos(time * 0.7 + normX * 14) * 12;
        const breathing = Math.sin(time * 0.5) * 8;

        const amplitude = (wave1 + wave2 + breathing) * (0.8 + mouseInfluence * 1.4);
        const barHeight = Math.max(4, Math.abs(amplitude * 1.5));

        const y1 = centerY - barHeight / 2;
        const y2 = centerY + barHeight / 2;

        // Gradient styling
        const isCenter = Math.abs(normX - 0.5) < 0.15;
        const strokeColor = isCenter
          ? `rgba(255, 90, 31, ${0.35 + mouseInfluence * 0.4})` // brand orange
          : `rgba(14, 59, 140, ${0.15 + mouseInfluence * 0.25})`; // brand navy

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.min(4, step * 0.4);
        ctx.lineCap = "round";
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lineCount, interactive]);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} />;
};
