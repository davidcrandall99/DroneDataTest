import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import { rootActions } from '../state';

export default function PathSettings() {
  const [state, dispatch] = useContext(Context)

  const showPath = () => {
    dispatch({
      type: rootActions.path.SHOW_PATH
    })
  }
  const hidePath = () => {
    dispatch({
      type: rootActions.path.HIDE_PATH
    })
  }
  const showObjectsNearPath = () => {
    dispatch({ type: rootActions.path.SHOW_OBJECTS_NEAR_PATH })
    dispatch({ type: rootActions.object.SET_OBJECTS_SHOWN, payload: true })
  }
  const clearLineSelecitons = () => {
    dispatch({ type: rootActions.path.CLEAR_LINE_SELECTIONS })
  }

  return (
    <div className='mb-4'>
      <p className="text-base">Path</p>
      <hr className="my-2"></hr>
      <button className="bg-slate-100 text-black py-1 px-2 m-1 ml-0 mb-3 rounded inline-block" disabled={!state.path.pathData} onClick={showPath}>Show Path</button>
      <button className="bg-slate-100 text-black py-1 px-2 m-1 mr-0 mb-3 rounded inline-block disabled:bg-slate-400" disabled={!state.path.pathData || !state.path.pathsShown} onClick={hidePath}>Hide Path</button>
      {!state.path.pathData &&
        <>
          <p><em>No path data</em></p>
        </>
      }
      {state.path.pathData &&
        <>
          {!state.path.pathsShown &&
            <>
              <p><em>No paths shown</em></p>
            </>
          }
          {
            !state.path.selectedPath && state.path.pathsShown &&
            <p>Click a path for more info</p>
          }
          {
            state.path.selectedPath &&
            <>
              <p><b>Path ID:</b> {state.path.selectedPath.properties.id}</p>
              <p><b>Altitude:</b> {state.path.selectedPath.properties.altitude}</p>
              <button className='underline block' onClick={showObjectsNearPath}>Show Nearby Objects</button>
              <button className="underline block" onClick={clearLineSelecitons}>Clear line selection</button>
            </>
          }
        </>
      }
    </div>
  )
}