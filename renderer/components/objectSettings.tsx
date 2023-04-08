import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import { rootActions } from '../state';

export default function ObjectSettings() {
  const [state, dispatch] = useContext(Context)
  const showObjects = () => {
    dispatch({
      type: rootActions.object.SHOW_ALL
    })
  }
  const hideObjects = () => {
    dispatch({
      type: rootActions.object.HIDE_OBJECT_LAYER
    })
  }
  const getObjectClass = () => {
    if (state.object.selectedObjectClass) {
      return state.object.selectedObjectClass.value
    } else if (state.object.objectClasses[state.object.selectedObject.properties.class]) {
      return state.object.selectedObject.properties.class
    } else {
      return state.object.objectClasses.unknown.value;
    }
  }
  const handleObjectChange = (e) => {
    dispatch({
      type: rootActions.object.SET_SELECTED_OBJECT_CLASS,
      payload: e.target.value
    })
  }
  const cancelClassification = () => {
    dispatch({ type: rootActions.object.EDITING_OBJECT_CLASS, payload: false })
  }
  const saveClassification = () => {
    dispatch({ type: rootActions.object.SAVE_OBJECT_DATA })
  }
  const clearObjectSelection = () => {
    dispatch({ type: "SET_CLICKED_OBJECT", payload: null })
  }

  return (
    <>
      <p className="text-base">Objects</p>
      <hr className="my-2"></hr>
      <button className="bg-slate-100 text-black py-1 px-2 m-1 ml-0 mb-3 rounded inline-block" disabled={!state.object.objectData} onClick={showObjects}>Show All Objects</button>
      <button className="bg-slate-100 text-black py-1 px-2 m-1 mr-0 mb-3 rounded inline-block disabled:bg-slate-400" disabled={!state.object.objectsShown} onClick={hideObjects}>Hide Objects</button>
      {!state.object.objectsShown &&
        <p><em>No objects shown</em></p>
      }
      {!state.object.selectedObject && state.object.objectsShown &&
        <p><em>No Objects Selected</em></p>
      }
      {
        state.object.selectedObject &&
        <>
          <p className='capitalize'>
            <b>Object Classification: </b>
            {!state.object.editingObjectClass &&
              <>
                {state.object.objectClasses[state.object.selectedObject.properties.class] ? state.object.objectClasses[state.object.selectedObject.properties.class].label : 'Unknown'}
                - <button className='underline' onClick={() => { dispatch({ type: rootActions.object.EDITING_OBJECT_CLASS, payload: true }) }}>Set Class</button>
              </>
            }
            {
              state.object.editingObjectClass &&
              <><br></br>
                <select className='text-black p-1 rounded' value={getObjectClass()} placeholder='Select Class' onChange={handleObjectChange}>

                  {Object.keys(state.object.objectClasses).map((key) => {
                    let option = state.object.objectClasses[key]
                    return (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    )
                  }
                  )}
                </select>
                <button onClick={cancelClassification} className="underline mx-2">Cancel</button>
                <button onClick={saveClassification} className="underline mx-2">Save</button>
              </>
            }
          </p>
          <p><b>Object ID:</b> {state.object.selectedObject.properties.id}</p>
          <p><b>Height:</b> {state.object.selectedObject.properties.height}</p>
          <button className='underline' onClick={clearObjectSelection}>Clear object selection</button>
        </>
      }
      {
        state.object.objectsShown &&
        <div className='mt-4'>
          <hr className='my-4'></hr>
          {Object.keys(state.object.objectClasses).map((key) => {
            let object = state.object.objectClasses[key]
            return (
            <div key={key} className='block my-4'>
              <div className='inline-block float-left mr-2 w-[20px] h-[20px]' style={{backgroundColor: object.color}}></div>
              <p className='py-[2px]'>{object.label}</p>
            </div>
            )
          })}
          <div className='block my-2'>
            <div className='inline-block float-left mr-2 w-[20px] h-[20px] bg-orange-400'></div>
              <p>Selected</p>
            </div>
          </div>
      }
    </>
  )
}