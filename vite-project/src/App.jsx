import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:8888");

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth - 50;
    canvas.height = window.innerHeight - 50;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    socket.on("draw", ({ x, y, prevX, prevY }) => {
      drawLine(prevX, prevY, x, y);
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  const drawLine = (prevX, prevY, x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setPrevPos({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    socket.emit("draw", { x: offsetX, y: offsetY, prevX: prevPos.x, prevY: prevPos.y });
    drawLine(prevPos.x, prevPos.y, offsetX, offsetY);
    setPrevPos({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const clearBoard = () => {
    socket.emit("clear");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Real-Time Whiteboard</h1>
      <button
        onClick={clearBoard}
        className="mb-4 px-6 cursor-pointer py-2 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 transition"
      >
        Clear Board
      </button>
      <div className="border-2 border-gray-600 rounded-md shadow-md bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-md cursor-crosshair"
        />
      </div>
    </div>
  );
}

export default App;