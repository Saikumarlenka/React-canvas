import React, { useEffect, useRef, useState } from 'react'

const Collision1 = () => {
    const CanvasRef= useRef(null)
    const ContextRef= useRef(null)
    const[isDrawing,setIsDrawing]=useState(false);
    const [mode,Setmode]=useState('pencil')
    const [shapes,setShapes]=useState([])
    const [startPos,setStartPos]=useState({x:0,y:0})
    const [color,setColor]=useState(null)
    const [lineWidth,setLineWidth]=useState(null)
    const [currentShape,setCurrentShape]=useState(null)

    useEffect(()=>{
        const canvas = CanvasRef.current
        canvas.width=1500;
        canvas.height=800;

        const ctx=canvas.getContext('2d')
        ctx.lineCap='round'
        ContextRef.current=ctx

    },[])

    const getCanvasPosition=(nativeEvent)=>{
        const canvas= CanvasRef.current
        const rect= canvas.getBoundingClient();

        return{
            x:nativeEvent.clientX- rect.left,
            y:nativeEvent.clientY-rect.top
        }
    }

    const startDrawing = ({nativeEvent}) =>{
        const{x,y}=getCanvasPosition(nativeEvent)

        setIsDrawing(true)
        setStartPos({x,y})

        if(mode==='pencil'){
            const newShape= {type:'pencil',points:[{x,y}],color,lineWidth}
            setCurrentShape(newShape)
        }
        else if(mode==='rectangle'){
            const newShape = {type:'rectangle',startX:x,startY:y,width:0,height:0,color,lineWidth}
            setCurrentShape(newShape)


        }
        else if(mode==='circle'){
            const newShape = {type:'circle',startX:x,startY:y,radius:0,color,lineWidth}
            setCurrentShape(newShape)

            
        }


    }
    const draw = ({nativeEvent}) =>{
        if(!isDrawing) return;

        const {x,y} = getCanvasPosition(nativeEvent)
    }

  return (
    <></>
  )
}

export default Collision1