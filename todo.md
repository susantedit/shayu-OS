1. Clipboard History Manager [Completed]
What it adds: A floating tray or popover that records the last 10 copied texts, letting you click to re-copy or insert them.
Where the file will be:
Store: src/store/clipboardStore.ts (listens to global copy events and holds the history array)
UI: src/components/ClipboardPopover.tsx (shown from the TopBar or via shortcut)