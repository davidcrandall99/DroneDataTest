import { useState } from "react";
import Draggable from "react-draggable";

export default function DraggableBox(props) {
    const [expanded, toggleExpanded] = useState(true)
    return (
        <Draggable bounds="parent">
        <div  className="bg-black/[0.5] absolute z-10 right-[50px] cursor-move"
            style={{
                top: props.y ? props.y : '100px',
                left: props.align == 'left' && props.x ? props.x : 'initial',
                right: props.align == 'right' && props.x ? props.x : '100px',
                width: props.width ? props.width : '400px',
                minHeight: props.height ? props.height : '400px',
            }}
        
        >
            <div className="bg-black/[0.7] px-4 py-2 w-full">
                <p className="inline text-base uppercase">Control panel</p>
                <button className="inline float-right text-xl line-height-0 mt-[-4px]" onClick={() =>{toggleExpanded(!expanded)}}>
                    {expanded ? '-' : '+'}
                </button>
            </div>
            <div className="p-4" style={{
                display: expanded ? 'block' : 'none'
            }}>
                {props.children}
            </div>
        </div>
        </Draggable>
    )
}