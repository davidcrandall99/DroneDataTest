import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import { PathGroup } from './path';
import maplibregl from 'maplibre-gl';
import { ObjectPolygon } from './objectPolygon';
import Draggable from './draggable';



export default function Map() {
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
        if(state.paths) {
            state.paths.showLayer(30)
        }
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


    return (
        <div className="w-full h-full absolute">
            <div className='w-full h-full' ref={mapContainer} />
            <Draggable>
                {state.paths !== null && !state.pathsShown &&
                    <button onClick={showPath}>Show Path</button>
                }
              
            </Draggable>
            <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
                <p>Lat: {state.lat}</p>
                <p>Lng: {state.lng}</p>
            </div>
            <div className="w-[250px] h-full bg-[rgba(0,0,0,0.5)] p-4 top-[55px] z-0 left-0 fixed text-white">
                {state.paths !== null &&
                    <button onClick={showPath}>Show Path</button>
                }
                {state.selectedObject &&
                  <p><b>ID:</b>{state.selectedObject.properties.id}<br></br>
                  <b>Object Height:{state.selectedObject.properties.height}</b>
                  <b>Object Type:{state.selectedObject.geometry.type}</b>
                  </p>
                }
            </div>
        </div>
    )
}

