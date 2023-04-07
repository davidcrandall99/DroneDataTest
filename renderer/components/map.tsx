import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import { PathGroup } from './path';
import maplibregl from 'maplibre-gl';
import { ObjectPolygon } from './objectPolygon';
import Draggable from './draggable';

const MapUIReducer = (state, action) => {

}

export default function Map() {

    const initialState = {
      editObjectClass: false
    }

    const [state, dispatch] = useContext(Context)

    const pathsData = state.pathData;
    const objectsData = state.objectData;

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [API_KEY] = useState(process.env.API_KEY); // api key for map tiles & styles; you can host your own locally, but for now, we'll use an external source

    const getStateFunction = useCallback(() => {
      return state
    }, [state])
    const showPath = () => {
        dispatch({
          type: "SHOW_PATH"
        })
    }
    const showObjects = () => {
        state.objects.showLayer(false)
    }

    // add a single path
    const addPathGroup = (id) => {
      if(state.pathData && !state.paths) {
        dispatch({
          type: 'ADD_DRONE_PATH',
          payload: new PathGroup(map.current, id, pathsData, getStateFunction, dispatch)
        })
      }
    }

    const addObjectGroup = (id) => {
      if(state.objectData && !state.objects) {
        dispatch({
          type: 'ADD_OBJECT_GROUP',
          payload: new ObjectPolygon(map.current, id, objectsData, getStateFunction, dispatch)
        })
      }
    }

    const showObjectsNearPath = () => {
      dispatch({ type: "SHOW_OBJECTS_NEAR_PATH"})
    }


    useEffect(() => {
        if (map.current) return; //stops map from intializing more than once
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${API_KEY}`,
            center: [state.lng, state.lat],
            zoom: state.zoom,
            attributionControl: false,
            // pitch
        });

        map.current.on('moveend', (e) => {
            const center = map.current.getCenter()
            dispatch({
                type: "SET_LNG_LAT",
                payload: {
                    lat: center.lat,
                    lng: center.lng
                }
            })
        })
        map.current.on('load', () => {
            // setPaths(new PathGroup(map.current, 'pathGroup', pathsData))
            dispatch({ type: "GET_PATH_DATA"})
            addPathGroup('drone A')
            addObjectGroup('object group a')
        })

    });

    useEffect(()=> {
      map.current.on('load', () => {
        addPathGroup('drone A')
      })
    }, [state.pathData])

    useEffect(() => {
      map.current.on('load', () => {
        addObjectGroup('objects A')
      })
    }, [state.objectData, state.objectGroup])

    const getObjectClass = () => {
      if(state.selectedObjectClass){
        return state.selectedObjectClass
      }
      if(state.selectedObject.properties.class) {
        return state.selectedObject.properties.class
      }
      return 'unknown';
    }
    const handleObjectChange = (e) => {
      dispatch({
        type: 'SET_SELECTED_OBJECT_CLASS',
        payload: e.target.value
      })
    }
    return (
        <div className="w-full h-full absolute">
            <div className='w-full h-full' ref={mapContainer} />
            <Draggable top={100} width="auto" height="auto">
                {state.paths && !state.pathsShown && !state.objectsShown &&
                    <button className="bg-white text-black py-2 px-4 rounded mx-auto block" onClick={showPath}>Show Path</button>
                }
                {
                  !state.selectedPath && state.pathsShown &&
                  <p>Click a path for more info</p>
                }

                {
                  state.selectedPath && !state.selectedObject &&
                  <p>
                    <b>Path ID:</b> {state.selectedPath.properties.id}<br/>
                    <b>Altitude:</b> {state.selectedPath.properties.altitude}<br/>
                    <button className='bg-white text-black py-2 px-4 rounded my-2' onClick={showObjectsNearPath}>Show Nearby Objects</button><br/>
                    <button className="underline" onClick={() => {dispatch({type: "CLEAR_LINE_SELECTIONS"})}}>Go Back</button>
                  </p>
                }
                {
                  state.selectedObject && 
                    <p>
                      <b>Object Class: </b> 
                      { !state.editingObjectClass &&
                      <>
                        <span className="capitalize">
                          { state.selectedObject.properties.class ? state.selectedObject.properties.class : 'Unknown' }
                        </span> - <button className='underline' onClick={()=>{dispatch({type:"EDITING_OBJECT_CLASS", payload: true})}}>Set Class</button><br/>
                      </>
                      }
                      { state.editingObjectClass &&
                        <>
                          <select className='text-black p-1 rounded' value={getObjectClass()} placeholder='Select Class' onChange={handleObjectChange}>
                            {state.objectClasses.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <button onClick={() => { dispatch({type: "EDITING_OBJECT_CLASS", payload: false}) }} className="underline mx-2">Cancel</button>
                          <button onClick={() => { dispatch({type: "SAVE_OBJECT_DATA" })}} className="underline mx-2">Save</button>
                          <br/>
                        </>
                      }
                      <b>Object ID:</b> {state.selectedObject.properties.id}<br/>
                      <b>Height:</b> {state.selectedObject.properties.height}<br/>
                      <button className="underline" onClick={() => {dispatch({type: "SET_CLICKED_OBJECT", payload: null})}}>Go Back</button>
                    </p>
                  
                }
            </Draggable>
            <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
                <p>Lat: {state.lat}</p>
                <p>Lng: {state.lng}</p>
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

