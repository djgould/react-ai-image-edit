"use client";
import { useInpaint } from "./hooks/useInpaint";
import {
  ComponentType,
  MouseEventHandler,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useUndo from "@djgould/react-use-undo/src";
import "./index.css";
import { Button } from "./Button";

export default function AIEdit({
  src,
  stabilityApiKey,
}: {
  src: string;
  stabilityApiKey: string;
}) {
  return <ImageDrawer src={src} stabilityApiKey={stabilityApiKey} />;
}

interface ImageDrawerProps {
  src: string;
  stabilityApiKey: string;
}

type DrawCommand =
  | { type: "end" }
  | ((
      | {
          type: "start";
          x: number;
          y: number;
          color: string;
          lineWidth: number;
        }
      | {
          type: "draw";
          x: number;
          y: number;
          lineWidth: number;
        }
    ) & { brushType: BrushType });

type Command =
  | { type: "draw"; steps: DrawCommand[] }
  | { type: "inpaint"; data: string }
  | { type: "clear" };

const LINE_SIZE = 20;

type BrushType = "brush" | "eraser";

function isInpaint(
  command: Command,
): command is Extract<Command, { type: "inpaint" }> {
  return command.type === "inpaint";
}

function findLastInpaint(commands: Command[]) {
  return commands.findLast(isInpaint);
}

function ImageDrawer({ src, stabilityApiKey }: ImageDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { commands, addCommand, undo, redo } = useUndo<Command>([]);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [brushSize, setBrushSize] = useState(LINE_SIZE);
  const [brushType, setBrushType] = useState<BrushType>("brush");
  const [prompt, setPrompt] = useState<string>("");
  const inpaintMutation = useInpaint({
    stabilityApiKey,
    onSuccess: (data) => {
      addCommand({
        type: "inpaint",
        data,
      });
    },
  });

  const imageSrc = findLastInpaint(commands)?.data || src;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvasRef?.current?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio; // Adjust for high-DPI devices

    const width = Math.floor(canvas.clientWidth * scale);
    const height = Math.floor(canvas.clientHeight * scale);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      context.scale(scale, scale); // Normalize coordinate system to use css pixels
      return true; // Canvas was resized
    }
    return false; // No resize necessary
  }, [canvasRef, image]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas, image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setImage(image);
    };

    image.src = src;
  }, [src]);

  const startDrawing: MouseEventHandler = (e) => {
    addCommand({
      type: "draw",
      steps: [
        {
          type: "start",
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          color: "black",
          lineWidth: brushSize,
          brushType,
        },
      ],
    });
  };

  const draw: MouseEventHandler = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const lastCommand = commands[commands.length - 1];
    if (!lastCommand || lastCommand.type === "inpaint") return;
    const last = lastCommand.steps[lastCommand.steps.length - 1];
    if (!last || last.type === "end") return;

    const { x: lastX, y: lastY } = last;
    const speed = Math.sqrt(
      Math.pow(offsetX - lastX, 2) + Math.pow(offsetY - lastY, 2),
    );
    const dynamicLineWidth = Math.max(brushSize, brushSize * 5 - speed / 10);

    addCommand((prev) => {
      const previous = prev[prev.length - 1];
      if (previous.type !== "draw") return prev;
      return [
        ...prev.slice(0, prev.length - 1),
        {
          ...previous,
          steps: [
            ...previous.steps,
            {
              type: "draw",
              x: offsetX,
              y: offsetY,
              lineWidth: dynamicLineWidth,
              brushType,
            },
          ],
        },
      ];
    });
  };

  const stopDrawing: MouseEventHandler = (e) => {
    addCommand((prev) => {
      const previous = prev[prev.length - 1];
      if (!previous || previous.type !== "draw") return prev;
      if (
        previous?.steps.length &&
        previous.steps[previous.steps.length - 1].type !== "end"
      ) {
        return [
          ...prev.slice(0, prev.length - 1),
          {
            ...previous,
            steps: [
              ...previous.steps,
              {
                type: "end",
              },
            ],
          },
        ];
      }
      return prev;
    });
  };

  const redrawCanvas = useCallback(
    (commands: Command[]) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || !image) return;
      context.clearRect(0, 0, canvas?.width, canvas?.height);

      let isDrawing = false;

      for (const command of commands) {
        switch (command.type) {
          case "draw":
            for (const step of command.steps) {
              switch (step.type) {
                case "start":
                  context.globalCompositeOperation =
                    step.brushType === "eraser"
                      ? "destination-out"
                      : "source-over";
                  context.lineCap = "round";
                  context.lineJoin = "round";
                  context.lineWidth = step.lineWidth;
                  context.strokeStyle = step.color;
                  context.beginPath();
                  context.moveTo(step.x, step.y);
                  isDrawing = true;
                  break;
                case "draw":
                  if (isDrawing) {
                    context.lineWidth = step.lineWidth;
                    context.lineTo(step.x, step.y);
                    context.stroke();
                  }
                  break;
                case "end":
                  context.closePath();
                  isDrawing = false;
                  break;
              }
            }
            break;
          case "clear":
            context.clearRect(0, 0, canvas.width, canvas.height);
            break;
          case "inpaint":
            break;
        }
      }
    },
    [canvasRef, image],
  );

  useEffect(() => {
    redrawCanvas(commands);
  }, [commands, redrawCanvas]);

  useEffect(() => {
    const resize = () => {
      resizeCanvas();
      redrawCanvas(commands);
    };
    window.addEventListener("resize", resize); // Add resize event listener
    return () => {
      window.removeEventListener("resize", resize); // Clean up
    };
  }, [commands, redrawCanvas, resizeCanvas]);

  return (
    <div>
      <div className="flex">
        <Button
          onClick={() => setBrushType("brush")}
          selected={brushType === "brush"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
            />
          </svg>
        </Button>
        <Button
          onClick={() => setBrushType("eraser")}
          selected={brushType === "eraser"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
            <path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z" />
          </svg>
        </Button>
        <Button onClick={undo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
        </Button>
        <Button onClick={redo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
            />
          </svg>
        </Button>

        <div>
          <input
            type="range"
            name="brushSize"
            min="1"
            max="100"
            onChange={(e) => setBrushSize(Number(e.target.value))}
            value={brushSize}
          />
          <label htmlFor="brushSize">Brush Size ({brushSize})</label>
        </div>
        <input
          type="text"
          placeholder="Enter prompt"
          className="border-black border"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button
          onClick={() => {
            canvasRef.current &&
              inpaintMutation.inpaint(imageSrc, canvasRef.current, prompt);
            const canvas = canvasRef?.current;
            const context = canvas?.getContext("2d");
            if (!canvas || !context) return;
            addCommand({ type: "clear" });
          }}
        >
          Inpaint
        </Button>
      </div>
      <div className="relative w-full">
        <canvas
          className="bg-transparent absolute top-0 left-0 right-0 bottom-0 w-full h-full"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          style={{
            display: "block",
            cursor: "crosshair",
          }}
        />
        <img src={imageSrc} alt="your image" className="w-full" />
      </div>
    </div>
  );
}
