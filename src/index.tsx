"use client";
import { useInpaint } from "@/hooks/useInpaint";
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

export default function AIEdit() {
  return (
    <>
      <h1>AI Edit</h1>
      <ImageDrawer src="/1.png" />
    </>
  );
}

interface ImageDrawerProps {
  src: string;
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
  | { type: "inpaint"; data: string };

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

function ImageDrawer({ src }: ImageDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { commands, addCommand, undo } = useUndo<Command>([]);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [brushSize, setBrushSize] = useState(LINE_SIZE);
  const [brushType, setBruchType] = useState<BrushType>("brush");
  const [prompt, setPrompt] = useState<string>("nile river");
  const inpaintMutation = useInpaint({
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
  }, [canvasRef]);

  useEffect(() => {
    resizeCanvas();
  }, [resizeCanvas, image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    setImage(image);
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
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
    setIsDrawing(true);
    console.log("startDrawing");
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

      <button onClick={undo}>Undo</button>
      <div>
        <input
          type="range"
          name="brushSize"
          min="1"
          max="100"
          onChange={(e) => setBrushSize(e.target.value)}
          value={brushSize}
        />
        <label htmlFor="brushSize">Brush Size ({brushSize})</label>
      </div>
      <div>
        <select
          value={brushType}
          onChange={(e) => setBruchType(e.target.value as BrushType)}
        >
          <option value="brush">Brush</option>
          <option value="eraser">Eraser</option>
        </select>
        <label htmlFor="brushType">Brush Type</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={() => {
            canvasRef.current &&
              inpaintMutation.inpaint(imageSrc, canvasRef.current, prompt);
            const canvas = canvasRef?.current;
            const context = canvas?.getContext("2d");
            if (!canvas || !context) return;
            context?.clearRect(0, 0, canvas?.width, canvas?.height);
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
}
