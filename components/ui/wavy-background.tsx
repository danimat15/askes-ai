// askes-ai/components/ui/wavy-background.tsx
"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { createNoise3D } from "simplex-noise";

interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: string;
  backgroundFill?: string;
  blur?: string;
  speed?: string;
  waveOpacity?: number;
  [key: string]: any;
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = "10px",
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: WavyBackgroundProps) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  }, [speed]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fillColors = colors || [
      "hsl(150, 60%, 40%)", // Greenish hue from theme
      "hsl(160, 70%, 50%)", // Lighter green
      "hsl(170, 80%, 60%)", // Cyan-green
      "hsl(180, 70%, 55%)", // Bluish-green
      "hsl(190, 60%, 50%)", // Lighter blue
    ];

    const wave = waveWidth || "50px";
    const bgFill = backgroundFill || "oklch(0.13 0.028 261.692)"; // Use dark background from theme

    let mouseX = 0;
    let mouseY = 0;

    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    fillColors.forEach((color, index) => {
      gradient.addColorStop(index / (fillColors.length - 1), color);
    });

    const drawWave = (time: number) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = bgFill;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.filter = `blur(${blur})`;
      ctx.globalAlpha = waveOpacity;
      ctx.beginPath();

      for (let x = 0; x < canvasWidth; x++) {
        const y =
          noise(x * 0.009, time * getSpeed(), 0) * 100 + // Adjusted multiplier for height
          noise(x * 0.005, time * getSpeed() * 1.5, 0) * 80 + // Another layer of noise
          (mouseY * 0.1) + // Mouse influence
          canvasHeight / 2; // Base line
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    let animationFrameId: number;

    const animateWave = (time: number) => {
      drawWave(time);
      animationFrameId = requestAnimationFrame(animateWave);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    if (containerRef.current) {
        containerRef.current.addEventListener("mousemove", handleMouseMove);
    }
    
    animateWave(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [canvasWidth, canvasHeight, colors, waveWidth, backgroundFill, blur, getSpeed, waveOpacity, noise]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        setCanvasWidth(canvasRef.current.parentElement.clientWidth);
        setCanvasHeight(canvasRef.current.parentElement.clientHeight);
      } else if (canvasRef.current) {
         setCanvasWidth(window.innerWidth);
         setCanvasHeight(window.innerHeight);
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        containerClassName
      )}
      ref={containerRef} // Attach ref to the container div
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="wavy-background-canvas"
        width={canvasWidth}
        height={canvasHeight}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
