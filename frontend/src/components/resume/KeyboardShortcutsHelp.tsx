import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { formatShortcut, SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { key: "S", shift: false, label: "Save", description: "Save your current progress" },
    { key: "Z", shift: false, label: "Undo", description: "Undo the last change" },
    { key: "Z", shift: true, label: "Redo", description: "Redo the last undone change" },
    { key: "D", shift: false, label: "Duplicate", description: "Create a copy of the resume" },
    { key: "P", shift: true, label: "Toggle Preview", description: "Toggle between edit and preview mode" },
    { key: "P", shift: false, label: "Print", description: "Print the resume" },
    { key: "E", shift: true, label: "Export", description: "Open export options" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to work faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key + (shortcut.shift ? "-shift" : "")}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium">{shortcut.label}</p>
                <p className="text-xs text-muted-foreground">
                  {shortcut.description}
                </p>
              </div>
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-muted border border-border rounded-md font-mono">
                {formatShortcut(shortcut.key, shortcut.shift)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Tip:</strong> Most shortcuts work from anywhere in the
            editor. Save works even when typing in text fields.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
