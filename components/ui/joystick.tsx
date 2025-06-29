import React, { useRef, useState, useEffect } from "react";

interface JoystickProps {
  onMove: (dx: number, dy: number) => void;
  onEnd: () => void;
  size?: number;
  thumbSize?: number;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, onEnd, size = 100, thumbSize = 48 }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });

  // Center of the joystick
  const center = size / 2;
  const maxRadius = (size - thumbSize) / 2;

  // Handle touch/mouse move
  const handleMove = (clientX: number, clientY: number) => {
    if (!outerRef.current) return;
    const rect = outerRef.current.getBoundingClientRect();
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;
    // Clamp to max radius
    const dist = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    const r = Math.min(dist, maxRadius);
    const dx = Math.cos(angle) * r;
    const dy = Math.sin(angle) * r;
    setThumbPos({ x: dx, y: dy });
    // Normalized direction for panning
    onMove(dx / maxRadius, dy / maxRadius);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    handleMove(e.clientX, e.clientY);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
  };

  const pointerMove = (e: PointerEvent) => {
    handleMove(e.clientX, e.clientY);
  };
  const pointerUp = () => {
    setDragging(false);
    setThumbPos({ x: 0, y: 0 });
    onEnd();
    window.removeEventListener("pointermove", pointerMove);
    window.removeEventListener("pointerup", pointerUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(120, 51, 255, 0.15)",
        border: "2px solid #a78bfa",
        position: "relative",
        touchAction: "none",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        style={{
          position: "absolute",
          left: center - thumbSize / 2 + thumbPos.x,
          top: center - thumbSize / 2 + thumbPos.y,
          width: thumbSize,
          height: thumbSize,
          borderRadius: "50%",
          background: dragging ? "#a78bfa" : "#ede9fe",
          border: "2px solid #a78bfa",
          boxShadow: dragging ? "0 0 8px #a78bfa" : undefined,
          transition: dragging ? "none" : "all 0.2s cubic-bezier(.4,2,.6,1)",
          touchAction: "none",
        }}
      />
    </div>
  );
};
