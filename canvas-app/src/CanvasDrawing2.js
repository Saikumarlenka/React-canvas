import React, { useRef, useState, useEffect } from 'react';

function CanvasDrawing1() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('pencil');
  const [shapes, setShapes] = useState([]);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [draggingShapeIndex, setDraggingShapeIndex] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1500;
    canvas.height = 800;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    contextRef.current = ctx;
  }, []);

  const getCanvasPosition = (nativeEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: nativeEvent.clientX - rect.left,
      y: nativeEvent.clientY - rect.top,
    };
  };

  const startDrawing = ({ nativeEvent }) => {
    const { x, y } = getCanvasPosition(nativeEvent);

    // Check if dragging an existing shape
    const shapeIndex = detectShape(x, y);
    if (shapeIndex !== -1) {
      setDraggingShapeIndex(shapeIndex);
      const shape = shapes[shapeIndex];
      setOffset({ x: x - shape.startX, y: y - shape.startY });
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    if (mode === 'pencil') {
      const newShape = { type: 'pencil', points: [{ x, y }], color, lineWidth };
      setCurrentShape(newShape);
    } else if (mode === 'rectangle') {
      const newShape = { type: 'rectangle', startX: x, startY: y, width: 0, height: 0, color, lineWidth };
      setCurrentShape(newShape);
    } else if (mode === 'circle') {
      const newShape = { type: 'circle', startX: x, startY: y, radius: 0, color, lineWidth };
      setCurrentShape(newShape);
    }
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing && draggingShapeIndex === null) return;

    const { x, y } = getCanvasPosition(nativeEvent);

    if (draggingShapeIndex !== null) {
      // Drag existing shape
      const updatedShapes = [...shapes];
      const shape = updatedShapes[draggingShapeIndex];
      const dx = x - offset.x;
      const dy = y - offset.y;

      if (shape.type === 'rectangle' || shape.type === 'circle') {
        shape.startX = dx;
        shape.startY = dy;
      } else if (shape.type === 'pencil') {
        const deltaX = dx - shape.startX;
        const deltaY = dy - shape.startY;
        shape.points = shape.points.map((point) => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        }));
        shape.startX = dx;
        shape.startY = dy;
      }

      setShapes(updatedShapes);
      redrawCanvas();
      return;
    }

    if (isDrawing && currentShape) {
      const newShape = { ...currentShape };

      if (mode === 'rectangle') {
        newShape.width = x - startPos.x;
        newShape.height = y - startPos.y;
      } else if (mode === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        newShape.radius = radius;
      } else if (mode === 'pencil') {
        newShape.points.push({ x, y });
      }

      setCurrentShape(newShape);
      redrawCanvas(newShape);
    }
  };

  const endDrawing = () => {
    if (draggingShapeIndex !== null) {
      setDraggingShapeIndex(null);
      return;
    }

    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentShape) {
      setShapes([...shapes, currentShape]);
      setCurrentShape(null);
    }
  };

  const detectShape = (x, y) => {
    return shapes.findIndex((shape) => {
      if (shape.type === 'rectangle') {
        return x >= shape.startX && x <= shape.startX + shape.width && y >= shape.startY && y <= shape.startY + shape.height;
      }
      if (shape.type === 'circle') {
        const dx = x - shape.startX;
        const dy = y - shape.startY;
        return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
      }
      if (shape.type === 'pencil') {
        return shape.points.some((point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5);
      }
      return false;
    });
  };

  const redrawCanvas = (previewShape = null) => {
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    [...shapes, previewShape].forEach((shape) => {
      if (!shape) return;

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
      <div className=' flex-1 flex justify-center items-center'>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        
        className="flex-1 bg-white border-gray-700 border-4 shadow-lg rounded"
      ></canvas>
      </div>
      
    </div>
  );
}

export default CanvasDrawing1;
