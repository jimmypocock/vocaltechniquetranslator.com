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

    // Don't trigger shortcuts when typing in input fields, but allow some exceptions
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Allow certain shortcuts even in input fields
      const allowedKeysInInputs = ['Escape', 'ArrowLeft', 'ArrowRight', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'v', 'u', '?'];
      const isAllowedKey = allowedKeysInInputs.includes(event.key);
      
      // Only allow Ctrl/Cmd shortcuts or specifically allowed keys in input fields
      if (!event.ctrlKey && !event.metaKey && !isAllowedKey) return;
    }

    shortcuts.forEach(shortcut => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = shortcut.shift ? event.shiftKey : true;
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