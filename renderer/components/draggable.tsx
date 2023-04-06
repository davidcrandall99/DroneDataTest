import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';

export default function Draggable({children}) {
    const [state, dispatch] = useContext(Context)

    return (
        <div className='w-[300px] h-[200px] bg-black/[0.6] absolute z-10 right-[50px] top-[80px] p-4'>
            {children}
        </div>
    )
}