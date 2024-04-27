# React `useUndo`

This is an undo hook for React. It is a simple hook that allows you to undo changes to a value.

installation:

```bash
npm install @djgould/react-use-undo
```

usage:

```jsx
import React from "react";
import { useUndo } from "@djgould/react-use-undo";

function App() {
  const [commands, addCommand, undo, redo] = useUndo(0);

  return (
    <div>
      <button onClick={() => addCommand(commands[commands.length] + 1)}>
        Increment
      </button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <p>last value: {commands[commands.length - 1]}</p>
    </div>
  );
}
```

## Running tests

```bash
npm test
```
