import React, { useRef, useState, useEffect } from 'react';

function CanvasDraw() {
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
      const updatedShapes = [...shapes];
      const shape = updatedShapes[draggingShapeIndex];
      const dx = x - offset.x;
      const dy = y - offset.y;

      const tentativeShape = { ...shape, startX: dx, startY: dy };

      if (!hasCollision(tentativeShape, updatedShapes.filter((_, i) => i !== draggingShapeIndex))) {
        shape.startX = dx;
        shape.startY = dy;

        if (shape.type === 'pencil') {
          const deltaX = dx - shape.startX;
          const deltaY = dy - shape.startY;
          shape.points = shape.points.map((point) => ({
            x: point.x + deltaX,
            y: point.y + deltaY,
          }));
        }
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

      if (!hasCollision(newShape, shapes)) {
        console.log('not collied');
        
        setCurrentShape(newShape);
        redrawCanvas(newShape);
      }
    }
  };

  const endDrawing = () => {
    if (draggingShapeIndex !== null) {
      setDraggingShapeIndex(null);
      return;
    }

    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentShape && !hasCollision(currentShape, shapes)) {
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

//   const hasCollision = (newShape, existingShapes) => {
//     return existingShapes.some((shape) => {
//       if (shape.type === 'rectangle' && newShape.type === 'rectangle') {
//         return (
//           newShape.startX < shape.startX + shape.width && // Collision on the left side
//           newShape.startX + newShape.width > shape.startX && // Collision on the right side
//           newShape.startY < shape.startY + shape.height && // Collision on the top side
//           newShape.startY + newShape.height > shape.startY // Collision on the bottom side
//         );
//       }
  
//       if (shape.type === 'circle' && newShape.type === 'circle') {
//         const dx = newShape.startX - shape.startX;
//         const dy = newShape.startY - shape.startY;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         return distance < newShape.radius + shape.radius; // Check if the circles overlap
//       }
  
//       if (shape.type === 'rectangle' && newShape.type === 'circle') {
//         const closestX = Math.max(shape.startX, Math.min(newShape.startX, shape.startX + shape.width));
//         const closestY = Math.max(shape.startY, Math.min(newShape.startY, shape.startY + shape.height));
//         const dx = newShape.startX - closestX;
//         const dy = newShape.startY - closestY;
//         return Math.sqrt(dx * dx + dy * dy) < newShape.radius; // Circle touches/overlaps rectangle
//       }
  
//       if (shape.type === 'circle' && newShape.type === 'rectangle') {
//         const closestX = Math.max(newShape.startX, Math.min(shape.startX, newShape.startX + newShape.width));
//         const closestY = Math.max(newShape.startY, Math.min(shape.startY, newShape.startY + newShape.height));
//         const dx = shape.startX - closestX;
//         const dy = shape.startY - closestY;
//         return Math.sqrt(dx * dx + dy * dy) < shape.radius; // Rectangle touches/overlaps circle
//       }
  
//       return false;
//     });
//   };
  
const hasCollision = (newShape, existingShapes) => {
    const getRectangleBounds = (rectangle) => {
      return {
        startX: Math.min(rectangle.startX, rectangle.startX + rectangle.width),
        endX: Math.max(rectangle.startX, rectangle.startX + rectangle.width),
        startY: Math.min(rectangle.startY, rectangle.startY + rectangle.height),
        endY: Math.max(rectangle.startY, rectangle.startY + rectangle.height)
      };
    };
  
    return existingShapes.some((shape) => {
      if (shape.type === 'rectangle' && newShape.type === 'rectangle') {
        const newBounds = getRectangleBounds(newShape);
        const shapeBounds = getRectangleBounds(shape);
  
        return !(
          newBounds.endX <= shapeBounds.startX || // No collision on the right
          newBounds.startX >= shapeBounds.endX || // No collision on the left
          newBounds.endY <= shapeBounds.startY || // No collision on the bottom
          newBounds.startY >= shapeBounds.endY // No collision on the top
        );
      }
  
      if (shape.type === 'circle' && newShape.type === 'circle') {
        const dx = newShape.startX - shape.startX;
        const dy = newShape.startY - shape.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < newShape.radius + shape.radius; // Check if the circles overlap
      }
  
      if (shape.type === 'rectangle' && newShape.type === 'circle') {
        const closestX = Math.max(shape.startX, Math.min(newShape.startX, shape.startX + shape.width));
        const closestY = Math.max(shape.startY, Math.min(newShape.startY, shape.startY + shape.height));
        const dx = newShape.startX - closestX;
        const dy = newShape.startY - closestY;
        return Math.sqrt(dx * dx + dy * dy) < newShape.radius; // Circle touches/overlaps rectangle
      }
  
      if (shape.type === 'circle' && newShape.type === 'rectangle') {
        const closestX = Math.max(newShape.startX, Math.min(shape.startX, newShape.startX + newShape.width));
        const closestY = Math.max(newShape.startY, Math.min(shape.startY, newShape.startY + newShape.height));
        const dx = shape.startX - closestX;
        const dy = shape.startY - closestY;
        return Math.sqrt(dx * dx + dy * dy) < shape.radius; // Rectangle touches/overlaps circle
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

export default CanvasDraw;
