"use client";

import { memo } from "react";
import { getStroke } from "perfect-freehand";
import type { DrawingPath } from "@/types/canvas";

interface DrawingLayerProps {
  paths: DrawingPath[];
  currentPath: { x: number; y: number }[];
  viewport: { x: number; y: number; zoom: number };
  drawingColor: string;
  strokeWidth: number;
}

function DrawingLayerComponent({
  paths,
  currentPath,
  viewport,
  drawingColor,
  strokeWidth,
}: DrawingLayerProps) {
  // Convert points array to SVG path data using perfect-freehand
  const getSvgPathFromStroke = (stroke: number[][]) => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        return acc;
      },
      ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
  };

  // Render a path using perfect-freehand for smooth strokes
  const renderPath = (points: { x: number; y: number }[], color: string, width: number) => {
    if (points.length < 2) return null;

    const stroke = getStroke(points, {
      size: width * 2,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    const pathData = getSvgPathFromStroke(stroke);

    return (
      <path
        d={pathData}
        fill={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-15"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <g
        transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
      >
        {/* Render saved paths */}
        {paths.map((path) => (
          <g key={path.id}>
            {renderPath(path.points, path.color, path.width)}
          </g>
        ))}

        {/* Render current path being drawn */}
        {currentPath.length > 0 && renderPath(currentPath, drawingColor, strokeWidth)}
      </g>
    </svg>
  );
}

export default memo(DrawingLayerComponent);
