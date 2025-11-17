"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function OutOfCreditsModal({
  isOpen,
  onClose,
  onUpgrade,
}: OutOfCreditsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Out of credits
          </DialogTitle>
          <DialogDescription className="text-center">
            You've used all available credits. Please add more credits or upgrade to
            continue using Anything.
          </DialogDescription>
        </DialogHeader>

        {/* Credit Display */}
        <div className="flex items-center justify-between px-6 py-4 bg-muted rounded-lg my-4">
          <span className="text-sm text-muted-foreground">Credits</span>
          <span className="text-2xl font-bold">0</span>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            onClick={onUpgrade}
            className="w-full bg-black hover:bg-gray-800"
          >
            Upgrade Plan
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            View pricing →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
