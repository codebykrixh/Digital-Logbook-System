'use client';

import * as React from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onCapture: (dataUrl: string) => void;
}

/** Canvas-based signature capture — mouse and touch, exports a base64 PNG. */
export function SignaturePad({ onCapture }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const hasStroke = React.useRef(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    hasStroke.current = true;
    setIsEmpty(false);
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasStroke.current) onCapture(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasStroke.current = false;
    setIsEmpty(true);
    onCapture('');
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl border-2 border-dashed bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          className="w-full cursor-crosshair touch-none rounded-xl"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isEmpty ? 'Sign above with your mouse or finger' : 'Signature captured'}
        </p>
        <Button type="button" size="sm" variant="ghost" onClick={clear}>
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}
