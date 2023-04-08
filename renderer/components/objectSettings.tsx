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
    } else if (state.object.selectedObject.properties.class) {
      return JSON.parse(state.object.selectedObject.properties.class).value
    } else {
      return state.object.objectClasses.unknown.value;
    }
  }
  const handleObjectChange = (e) => {
    console.log('value', e.target.value)
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
      <p className="text-lg">Objects</p>
      <hr className="my-2"></hr>
      <button className="bg-slate-100 text-black py-1 px-2 m-2 ml-0 rounded inline-block" disabled={!state.object.objectData} onClick={showObjects}>Show All Objects</button>
      <button className="bg-slate-100 text-black py-1 px-2 m-2 mr-0 rounded inline-block disabled:bg-slate-400" disabled={!state.object.objectsShown} onClick={hideObjects}>Hide Objects</button>
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
                {state.object.selectedObject.properties.class ? JSON.parse(state.object.selectedObject.properties.class).label : 'Unknown'}
                - <button className='underline' onClick={() => { dispatch({ type: rootActions.object.EDITING_OBJECT_CLASS, payload: true }) }}>Set Class</button>
              </>
            }
            {
              state.object.editingObjectClass &&
              <>
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
    </>
  )
}