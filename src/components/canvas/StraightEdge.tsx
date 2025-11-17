"use client";

import { BaseEdge, EdgeProps, getBezierPath, getStraightPath } from "@xyflow/react";

export default function StraightEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps) {
  // Check if nodes are vertically aligned (within a small threshold)
  const isVerticallyAligned = Math.abs(sourceX - targetX) < 5;

  // Use straight path if aligned, bezier if not
  const [edgePath] = isVerticallyAligned
    ? getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      })
    : getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });

  return <BaseEdge id={id} path={edgePath} style={style} />;
}
