import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Always allow standard cut/copy/paste/select all commands
    const isModifierKey = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    
    // Standard commands that should always work
    const standardCommands = [
      'a', // select all
      'c', // copy
      'x', // cut
      'v', // paste
      'z', // undo
      'y', // redo (Windows)
      's', // save
      'f', // find
      'g', // find next
      'r', // refresh/reload
      'p', // print
      'o', // open
      'n', // new
      'w', // close tab/window
      't', // new tab
      '+', // zoom in
      '-', // zoom out
      '0', // reset zoom
    ];
    
    // Also allow Shift+Z for redo on Mac
    if (isModifierKey && (standardCommands.includes(key) || (event.shiftKey && key === 'z'))) {
      // Let the browser handle these standard commands
      return;
    }

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Only allow Ctrl/Cmd shortcuts in input fields
      if (!event.ctrlKey && !event.metaKey) return;
    }

    shortcuts.forEach(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
}