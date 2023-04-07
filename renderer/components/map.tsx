import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { rootActions } from '../state';
import { Context } from '../pages/_app';
import { PathGroup } from './path';
import maplibregl from 'maplibre-gl';
import { ObjectPolygon } from './objectPolygon';
import Draggable from './draggable';

const MapUIReducer = (state, action) => {

}

export default function Map() {

  const [state, dispatch] = useContext(Context)
  const pathsData = state.path.pathData;
  const objectsData = state.object.objectData;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [API_KEY] = useState(process.env.API_KEY); // api key for map tiles & styles; you can host your own locally, but for now, we'll use an external source

  const getStateFunction = useCallback(() => {
    return state
  }, [state])
  const showPath = () => {
    dispatch({
      type: rootActions.path.SHOW_PATH
    })
  }
  const showObjects = () => {
    state.object.objects.showLayer(false)
  }

  // add a single path
  const addPathGroup = (id) => {
    if (state.path.pathData && !state.path.paths) {
      dispatch({
        type: rootActions.path.ADD_DRONE_PATH,
        payload: new PathGroup(map.current, id, pathsData, getStateFunction, dispatch)
      })
    }
  }

  const addObjectGroup = (id) => {
    if (state.object.objectData && !state.object.objects) {
      dispatch({
        type: rootActions.object.ADD_OBJECT_GROUP,
        payload: new ObjectPolygon(map.current, id, objectsData, getStateFunction, dispatch)
      })
    }
  }

  const showObjectsNearPath = () => {
    dispatch({ type: rootActions.path.SHOW_OBJECTS_NEAR_PATH })
    dispatch({ type: rootActions.object.SET_OBJECTS_SHOWN, payload: true })
  }


  useEffect(() => {
    if (map.current) return; //stops map from intializing more than once
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${API_KEY}`,
      center: [state.map.lng, state.map.lat],
      zoom: state.map.zoom,
      attributionControl: false,
      // pitch
    });

    map.current.on('moveend', (e) => {
      const center = map.current.getCenter()
      dispatch({
        type: rootActions.map.SET_LNG_LAT,
        payload: {
          lat: center.lat,
          lng: center.lng
        }
      })
    })
    map.current.on('load', () => {
      // setPaths(new PathGroup(map.current, 'pathGroup', pathsData))
      dispatch({ type: rootActions.path.GET_PATH_DATA })
      addPathGroup('drone A')
      addObjectGroup('object group a')
    })

  });

  useEffect(() => {
    map.current.on('load', () => {
      addPathGroup('drone A')
    })
  }, [state.path.pathData])

  useEffect(() => {
    map.current.on('load', () => {
      addObjectGroup('objects A')
    })
  }, [state.object.objectData, state.object.objectGroup])

  const getObjectClass = () => {
    
    if (state.object.selectedObjectClass) {
      return state.object.selectedObjectClass
    } else if (state.object.selectedObject.properties.class) {
      return state.object.selectedObject.properties.class
    } else {
      return 'unknown';
    }
  }
  const handleObjectChange = (e) => {
    dispatch({
      type: rootActions.object.SET_SELECTED_OBJECT_CLASS,
      payload: e.target.value
    })
  }
  const clearLineSelecitons = () => {
    dispatch({ type: rootActions.path.CLEAR_LINE_SELECTIONS })
    dispatch({ type: rootActions.object.HIDE_OBJECT_LAYER })
  }
  const hideObjects = () => {
    dispatch({ type: rootActions.object.HIDE_OBJECT_LAYER })
  }
  return (
    <div className="w-full h-full absolute">
      <div className='w-full h-full' ref={mapContainer} />
      <Draggable top={100} width="auto" height="auto">
        {state.path.paths && !state.path.pathsShown && !state.object.objectsShown &&
          <button className="bg-white text-black py-2 px-4 rounded mx-auto block" onClick={showPath}>Show Path</button>
        }
        {
          !state.path.selectedPath && state.path.pathsShown &&
          <p>Click a path for more info</p>
        }

        {
          state.path.selectedPath && !state.object.selectedObject &&
          <p>
            <b>Path ID:</b> {state.path.selectedPath.properties.id}<br />
            <b>Altitude:</b> {state.path.selectedPath.properties.altitude}<br />
            {!state.object.objectsShown &&
              <button className='bg-white text-black py-2 px-4 rounded my-2' onClick={showObjectsNearPath}>Show Nearby Objects</button>
            }
            {
              state.object.objectsShown &&
              <button className='bg-white text-black py-2 px-4 rounded my-2' onClick={hideObjects}>Hide Nearby Objects</button>
            }
            <br />
            <button className="underline" onClick={clearLineSelecitons}>Go Back</button>
          </p>
        }
        {
          state.object.selectedObject &&
          <p>
            <b>Object Class: </b>
            {!state.object.editingObjectClass &&
              <>
                <span className="capitalize">
                  {state.object.selectedObject.properties.class ? state.object.selectedObject.properties.class : 'Unknown'}
                </span> - <button className='underline' onClick={() => { dispatch({ type: rootActions.object.EDITING_OBJECT_CLASS, payload: true }) }}>Set Class</button><br />
              </>
            }
            {state.object.editingObjectClass &&
              <>
                <select className='text-black p-1 rounded' value={getObjectClass()} placeholder='Select Class' onChange={handleObjectChange}>
                  {state.object.objectClasses.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button onClick={() => { dispatch({ type: rootActions.object.EDITING_OBJECT_CLASS, payload: false }) }} className="underline mx-2">Cancel</button>
                <button onClick={() => { dispatch({ type: rootActions.object.SAVE_OBJECT_DATA }) }} className="underline mx-2">Save</button>
                <br />
              </>
            }
            <b>Object ID:</b> {state.object.selectedObject.properties.id}<br />
            <b>Height:</b> {state.object.selectedObject.properties.height}<br />
            <button className="underline" onClick={() => { dispatch({ type: "SET_CLICKED_OBJECT", payload: null }) }}>Go Back</button>
          </p>

        }
      </Draggable>
      <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
        <p>Lat: {state.map.lat}</p>
        <p>Lng: {state.map.lng}</p>
      </div>
      {/* <div className="w-[250px] h-full bg-[rgba(0,0,0,0.5)] p-4 top-[55px] z-0 left-0 fixed text-white">
                {state.paths !== null &&
                    <button onClick={showPath}>Show Path</button>
                }
                {state.selectedObject &&
                  <p><b>ID:</b>{state.selectedObject.properties.id}<br></br>
                  <b>Object Height:{state.selectedObject.properties.height}</b>
                  <b>Object Type:{state.selectedObject.geometry.type}</b>
                  </p>
                }
            </div> */}
    </div>
  )
}

