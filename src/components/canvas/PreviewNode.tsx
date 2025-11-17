"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";

function PreviewNodeComponent({ data }: NodeProps) {
  return (
    <div className="bg-card shadow-lg rounded-xl p-3 w-[225px]">
      <div
        className="bg-muted/50 p-4 rounded-lg text-xs font-sans"
        style={{
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap'
        }}
      >
        {data.content}
      </div>
    </div>
  );
}

export default memo(PreviewNodeComponent);
