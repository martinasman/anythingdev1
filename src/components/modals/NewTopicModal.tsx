"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topic: string) => void;
  position?: { x: number; y: number };
}

export default function NewTopicModal({
  isOpen,
  onClose,
  onSubmit,
}: NewTopicModalProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (topic.trim()) {
      onSubmit(topic);
      setTopic("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new topic</DialogTitle>
          <DialogDescription>
            What would you like to talk about?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a topic..."
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!topic.trim()}
            style={{ backgroundColor: '#0192c6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#017aa3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0192c6'}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
