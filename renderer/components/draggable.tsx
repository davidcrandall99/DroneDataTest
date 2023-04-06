import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import Draggable, {DraggableCore} from "react-draggable";

export default function DraggableBox(props) {
    const [state, dispatch] = useContext(Context)
    const classList = () => {
        return
      }
    return (
        <Draggable bounds="parent">
        <div 
            className="bg-black/[0.6] absolute z-10 right-[50px] p-4 cursor-move"
            style={{
                top: props.top ? props.top : '100px',
                left: props.align == 'left' && props.x ? props.x : 'initial',
                right: props.align == 'right' && props.x ? props.x : '100px',
                width: props.width ? props.width : '400px',
                minHeight: props.height ? props.height : '400px',
            }}
        
        >
            {props.children}
        </div>
        </Draggable>
    )
}