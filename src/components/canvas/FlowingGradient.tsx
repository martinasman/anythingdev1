"use client";

import { useEffect, useRef } from "react";

interface FlowingGradientProps {
  backgroundType?: string;
}

const backgroundColorSchemes: Record<string, { colors: { r: number; g: number; b: number }[]; base: string }> = {
  default: {
    colors: [
      { r: 230, g: 240, b: 180 },  // Muted yellow (desaturated)
      { r: 140, g: 200, b: 220 },  // Muted blue (desaturated)
      { r: 185, g: 220, b: 200 },  // Muted cyan blend (middle transition)
    ],
    base: "#c0d8d0"
  },
  neutral: {
    colors: [
      { r: 239, g: 235, b: 226 },  // Off-white (#efebe2)
      { r: 255, g: 255, b: 255 },  // White (#ffffff)
      { r: 247, g: 245, b: 240 },  // Light blend between the two
    ],
    base: "#f5f5f5"
  },
  ocean: {
    colors: [
      { r: 102, g: 126, b: 234 },  // Blue
      { r: 6, g: 182, b: 212 },    // Cyan
      { r: 59, g: 130, b: 246 },   // Light blue
    ],
    base: "#0f172a"
  },
  sunset: {
    colors: [
      { r: 43, g: 52, b: 72 },     // #2b3448 - Dark blue-gray (top)
      { r: 29, g: 90, b: 110 },    // #1d5a6e - Teal
      { r: 79, g: 179, b: 179 },   // #4fb3b3 - Cyan
      { r: 239, g: 191, b: 77 },   // #efbf4d - Gold
      { r: 237, g: 167, b: 64 },   // #eda740 - Orange
      { r: 239, g: 235, b: 226 },  // #efebe2 - Off-white (bottom)
    ],
    base: "#2b3448"
  },
  sunrise: {
    colors: [
      { r: 239, g: 191, b: 77 },   // #efbf4d - Gold (top)
      { r: 239, g: 235, b: 226 },  // #efebe2 - Off-white
      { r: 79, g: 179, b: 179 },   // #4fb3b3 - Cyan
      { r: 29, g: 90, b: 110 },    // #1d5a6e - Teal (bottom)
    ],
    base: "#efbf4d"
  },
};

export default function FlowingGradient({ backgroundType = "default" }: FlowingGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // If Shrek background is selected, use image instead
    if (backgroundType === "shrek") {
      const img = new Image();
      img.src = "https://i.imgur.com/f91aPB2.jpeg"; // Shrek image URL
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const drawShrek = () => {
          // Draw the image to cover the entire canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawShrek);
        };
        drawShrek();
      };

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    // Animation parameters
    let time = 0;
    const scheme = backgroundColorSchemes[backgroundType] || backgroundColorSchemes.default;
    const colors = scheme.colors;
    const baseColor = scheme.base;

    const animate = () => {
      time += 0.0003; // Even slower and smoother

      // Create flowing gradient effect
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const numColors = colors.length;

      // Dynamically cycle through all colors based on number of colors in array
      if (numColors === 3) {
        // Original 3-color logic
        const t1 = (Math.sin(time) + 1) / 2;
        const t2 = (Math.sin(time + Math.PI * 2/3) + 1) / 2;
        const t3 = (Math.sin(time + Math.PI * 4/3) + 1) / 2;

        gradient.addColorStop(0, `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, ${0.3 + t1 * 0.2})`);
        gradient.addColorStop(0.5, `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, ${0.2 + t2 * 0.15})`);
        gradient.addColorStop(1, `rgba(${colors[2].r}, ${colors[2].g}, ${colors[2].b}, ${0.25 + t3 * 0.15})`);
      } else {
        // Dynamic cycling for 4+ colors - cycle through all colors over time
        const cycleSpeed = 2; // Lower = slower cycle
        const colorIndex = time * cycleSpeed;

        // Distribute color stops evenly and cycle through the array
        for (let i = 0; i < numColors; i++) {
          const position = i / (numColors - 1);
          const colorIdx = Math.floor(colorIndex + i) % numColors;
          const nextColorIdx = (colorIdx + 1) % numColors;

          // Blend between current and next color
          const blend = (colorIndex + i) % 1;
          const r = Math.round(colors[colorIdx].r * (1 - blend) + colors[nextColorIdx].r * blend);
          const g = Math.round(colors[colorIdx].g * (1 - blend) + colors[nextColorIdx].g * blend);
          const b = Math.round(colors[colorIdx].b * (1 - blend) + colors[nextColorIdx].b * blend);

          const opacity = 0.2 + (Math.sin(time + i * Math.PI / 2) + 1) * 0.1;
          gradient.addColorStop(position, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        }
      }

      // Clear and draw
      ctx.fillStyle = baseColor; // Base background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add radial gradient for depth
      const radialGradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.4) * 300,
        canvas.height / 2 + Math.cos(time * 0.3) * 300,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.8
      );

      const accentColorIdx = Math.floor(time * 2) % numColors;
      const accentColor = colors[accentColorIdx];
      const midColor = colors[Math.floor(numColors / 2)];
      radialGradient.addColorStop(0, `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.1)`);
      radialGradient.addColorStop(0.5, `rgba(${midColor.r}, ${midColor.g}, ${midColor.b}, 0.05)`);
      radialGradient.addColorStop(1, "transparent");

      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [backgroundType]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
