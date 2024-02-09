import {
  CSSProperties,
  ChangeEventHandler,
  PointerEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HexColor, PixelCRDT } from "../crdt/PixelCRDT";
import styles from "./PixelEditor.module.css";

interface Coordinate {
  x: number;
  y: number;
}

interface PixelEditorProps {
  id: string;
  name?: string;
  style?: CSSProperties;
  latency?: number;
  width?: number;
  height?: number;
  onStateChange: (state: PixelCRDT["state"]) => void;
  state?: PixelCRDT["state"];
}

export default function PixelEditor(props: PixelEditorProps) {
  const { width = 400, height = 400, onStateChange } = props;
  const [currentColor, setCurrentColor] = useState<HexColor>("#ffffff");
  const [pixelData, setPixelData] = useState<PixelCRDT | null>(null);
  const [mousePosition, setMousePosition] = useState<Coordinate | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPixelData(new PixelCRDT(props.id));
  }, [props.id]);

  const getCoordinate = (
    event: Pick<PointerEvent, "pageX" | "pageY">
  ): Coordinate | null => {
    if (!canvasRef.current) {
      return null;
    }
    return {
      x: event.pageX - canvasRef.current.offsetLeft,
      y: event.pageY - canvasRef.current.offsetTop,
    };
  };

  const handlePaletteChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setCurrentColor(event.target.value);
  };

  const handlePointerDown: PointerEventHandler<HTMLCanvasElement> = (event) => {
    canvasRef.current?.setPointerCapture(event.pointerId);
    setMousePosition(getCoordinate(event));
  };

  const updateState = useCallback(
    (
      originalCoord: Coordinate,
      newMousePosition: Coordinate,
      color: string
    ) => {
      if (!pixelData) {
        return;
      }
      pixelData?.set({
        from: originalCoord,
        to: newMousePosition,
        color,
      });
      onStateChange(pixelData.state);
    },
    [pixelData, onStateChange]
  );

  const draw = useCallback(
    (
      originalMousePosition: Coordinate,
      newMousePosition: Coordinate,
      color: string
    ) => {
      if (!canvasRef.current) {
        return;
      }
      const context = canvasRef.current.getContext("2d");
      if (!context) {
        return;
      }
      context.strokeStyle = color;
      context.lineJoin = "round";
      context.lineWidth = 2;

      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.closePath();

      context.stroke();
      updateState(originalMousePosition, newMousePosition, color);
      setMousePosition(newMousePosition);
    },
    [updateState]
  );

  const clearCanvas = useCallback(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context || !canvasRef.current) {
      return;
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const redraw = useCallback(
    (states: PixelCRDT["state"]) => {
      clearCanvas();
      for (const [, state] of Object.entries(states)) {
        if (!state.value) {
          continue;
        }
        draw(state.value.from, state.value.to, state.value.color);
      }
    },
    [clearCanvas, draw]
  );
  useEffect(() => {
    if (props.state && pixelData) {
      pixelData?.merge(props.state);
      redraw(pixelData.state);
    }
  }, [pixelData, props.state, redraw]);

  const handlePointerMove: PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (
      !canvasRef.current?.hasPointerCapture(event.pointerId) ||
      !mousePosition
    ) {
      return;
    }

    const newMousePosition = getCoordinate(event);
    if (!newMousePosition) {
      return;
    }

    draw(mousePosition, newMousePosition, currentColor);
  };

  return (
    <div className={styles.editor}>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          canvasRef.current?.releasePointerCapture(event.pointerId);
        }}
        width={width}
        height={height}
      />
      <input type="color" onChange={handlePaletteChange} />
    </div>
  );
}
