import { Suspense } from "react";
import Canvas from "@/components/canvas/Canvas";

export default function CanvasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="text-lg font-medium">Loading canvas...</div>
        </div>
      </div>
    }>
      <Canvas />
    </Suspense>
  );
}
