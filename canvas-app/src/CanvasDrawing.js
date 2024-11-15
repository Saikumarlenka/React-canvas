import React, { useRef, useState, useEffect } from 'react';

function CanvasDrawing() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('pencil');
  const [shapes, setShapes] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1500;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    contextRef.current = ctx;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setStartPos({ x: offsetX, y: offsetY });
    setIsDrawing(true);

    const ctx = contextRef.current;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (mode === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setShapes([...shapes, { type: 'pencil', points: [{ x: offsetX, y: offsetY }], color, lineWidth }]);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = contextRef.current;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    redrawShapes();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (mode === 'pencil') {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      const newShapes = [...shapes];
      newShapes[newShapes.length - 1].points.push({ x: offsetX, y: offsetY });
      setShapes(newShapes);
    } else if (mode === 'rectangle') {
      ctx.beginPath();
      ctx.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
      ctx.stroke();
    } else if (mode === 'circle') {
      const radius = Math.sqrt(Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const endDrawing = ({ nativeEvent }) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const { offsetX, offsetY } = nativeEvent;

    if (mode === 'pencil') {
      const ctx = contextRef.current;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (mode === 'rectangle') {
      const width = offsetX - startPos.x;
      const height = offsetY - startPos.y;
      setShapes([...shapes, { type: 'rectangle', startX: startPos.x, startY: startPos.y, width, height, color, lineWidth }]);
    } else if (mode === 'circle') {
      const radius = Math.sqrt(Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2));
      setShapes([...shapes, { type: 'circle', startX: startPos.x, startY: startPos.y, radius, color, lineWidth }]);
    }
  };

  const redrawShapes = () => {
    const ctx = contextRef.current;
    shapes.forEach((shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.lineWidth;
      if (shape.type === 'rectangle') {
        ctx.rect(shape.startX, shape.startY, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        ctx.arc(shape.startX, shape.startY, shape.radius, 0, Math.PI * 2);
      } else if (shape.type === 'pencil') {
        shape.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
      }
      ctx.stroke();
    });
  };

  const clearCanvas = () => {
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShapes([]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-gray-800 text-white p-6 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6">Drawing Tools</h2>
        
        <label className="text-sm font-semibold mt-4">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full mt-2"
        />

        <label className="text-sm font-semibold mt-4">Line Size</label>
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-full mt-2"
        />

        <div className="flex flex-col w-full mt-6">
          <button
            onClick={() => setMode('pencil')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded mt-2"
          >
            Pencil
          </button>
          <button
            onClick={() => setMode('rectangle')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded mt-2"
          >
            Rectangle
          </button>
          <button
            onClick={() => setMode('circle')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded mt-2"
          >
            Circle
          </button>
          <button
            onClick={clearCanvas}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded mt-2"
          >
            Clear Canvas
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          className="border-4 border-gray-400 bg-white shadow-lg rounded"
        />
      </div>
    </div>
  );
}

export default CanvasDrawing;
