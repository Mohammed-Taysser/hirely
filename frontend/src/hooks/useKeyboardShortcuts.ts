import { useEffect, useCallback } from "react";

interface KeyboardShortcuts {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
  onPreview?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSave,
  onUndo,
  onRedo,
  onDuplicate,
  onPreview,
  onPrint,
  onExport,
  enabled = true,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // For some shortcuts, we still want them to work in inputs
      const alwaysAllowShortcuts = ["s"]; // Save should always work

      if (modifier) {
        const key = event.key.toLowerCase();

        // Check if we should allow this shortcut
        if (isInputFocused && !alwaysAllowShortcuts.includes(key)) {
          return;
        }

        switch (key) {
          case "s":
            event.preventDefault();
            onSave?.();
            break;
          case "z":
            event.preventDefault();
            if (event.shiftKey) {
              onRedo?.();
            } else {
              onUndo?.();
            }
            break;
          case "y":
            event.preventDefault();
            onRedo?.();
            break;
          case "d":
            event.preventDefault();
            onDuplicate?.();
            break;
          case "p":
            if (event.shiftKey) {
              event.preventDefault();
              onPreview?.();
            } else {
              // Allow default print for Ctrl+P
              if (onPrint) {
                event.preventDefault();
                onPrint();
              }
            }
            break;
          case "e":
            if (event.shiftKey) {
              event.preventDefault();
              onExport?.();
            }
            break;
        }
      }
    },
    [enabled, onSave, onUndo, onRedo, onDuplicate, onPreview, onPrint, onExport]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Helper component to display keyboard shortcut hints
export function formatShortcut(key: string, includeShift = false): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modifier = isMac ? "⌘" : "Ctrl";
  const shift = includeShift ? (isMac ? "⇧" : "Shift+") : "";
  return `${modifier}+${shift}${key.toUpperCase()}`;
}

export const SHORTCUTS = {
  save: { key: "S", label: "Save" },
  undo: { key: "Z", label: "Undo" },
  redo: { key: "Z", shift: true, label: "Redo" },
  duplicate: { key: "D", label: "Duplicate" },
  preview: { key: "P", shift: true, label: "Toggle Preview" },
  print: { key: "P", label: "Print" },
  export: { key: "E", shift: true, label: "Export" },
} as const;
