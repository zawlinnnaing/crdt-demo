import {
  CSSProperties,
  ChangeEventHandler,
  PointerEventHandler,
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
  const { width = 400, height = 400 } = props;
  const [currentColor, setCurrentColor] = useState<HexColor>("#ffffff");
  const [pixelData, setPixelData] = useState<PixelCRDT | null>(null);
  const [mousePosition, setMousePosition] = useState<Coordinate | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPixelData(new PixelCRDT(props.id));
  }, [props.id]);

  useEffect(() => {
    if (props.state && pixelData) {
      pixelData?.merge(props.state);
    }
  }, [pixelData, props.state]);

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

  const updateState = (
    originalCoord: Coordinate,
    newMousePosition: Coordinate,
    color: string
  ) => {
    if (!pixelData) {
      return;
    }
    const [startX, endX] =
      originalCoord.x > newMousePosition.x
        ? [newMousePosition.x, originalCoord.x]
        : [originalCoord.x, newMousePosition.x];
    const [startY, endY] =
      originalCoord.y > newMousePosition.y
        ? [newMousePosition.y, originalCoord.y]
        : [originalCoord.y, newMousePosition.y];
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        pixelData?.set(x, y, color);
      }
    }
    props.onStateChange(pixelData.state);
  };

  const draw = (
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
  };

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

    pixelData?.set(newMousePosition.x, newMousePosition.y, currentColor);
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
