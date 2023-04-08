import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { rootActions } from '../state';
import { Context } from '../pages/_app';
import { PathGroup } from './path';
import maplibregl from 'maplibre-gl';
import { ObjectPolygon } from './objectPolygon';
import Draggable from './draggable';
import PathSettings from './pathSettings';
import ObjectSettings from './objectSettings';

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


  return (
    <div className="w-full h-full absolute">
      <div className='w-full h-full' ref={mapContainer} />
      <Draggable top={100} width={370} height="auto" y="0" x="0" align="right">
        <PathSettings />
        <ObjectSettings />
      </Draggable>
      <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
        <p>Lat: {state.map.lat}</p>
        <p>Lng: {state.map.lng}</p>
      </div>
    </div>
  )
}

