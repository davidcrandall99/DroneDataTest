import React, { createContext, useReducer } from 'react';
import type { AppProps } from 'next/app';
const pathData = require('../mockData/paths.json');
const objectData = require('../mockData/objects.json');
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(Reducer, initialState)
  return (
    <Context.Provider value={[state, dispatch]}>
      <Component {...pageProps} />
    </Context.Provider>
  );
}

const initialState:any = {
  map: null,
  lat: null,
  lng: null,
  pitch: null,
  zoom: null,
  clickedLineId: null,
  hoveredLineId: null,
  pathData: null,
  objectData: null,
  paths: null,
  pathsShown: false,
  objects: null,
  selectedObject: null
}

const Reducer = (state, action) => {
  const newState = Object.assign({}, state)
  const payload = action.payload
  switch (action.type) {
    case "SET_LNG_LAT":
      newState.lat = payload.lat;
      newState.lng = payload.lng;
      return newState
    case "SET_CLICKED_LINE_ID":
      newState.clickedLineId = payload
      return newState;
    case "SET_HOVERED_LINE_ID":
      newState.hoveredLineId = payload
      return newState;
    case "ADD_DRONE_PATH":
      newState.paths = payload
      newState.pathsShown = true
      return newState
    case "ADD_OBJECT_GROUP":
      newState.objects = payload
      console.log('set objects')
      console.log(newState.objects)
      return newState;
    case "SHOW_OBJECT_LAYER":
      if(payload) {
        newState.objects.showObjectsNearPoint(payload)
      } else {
        newState.objects.showLayer()
      }
      return newState;
    case "SHOW_PATH":
      if(newState.paths != null) {
        newState.paths.showLayer(30)
      }
      return newState;
    case "SET_OBJECT_DATA":
      
      return newState;
    case "HIDE_OBJECT_LAYER":
        newState.objects.removeObjects()
        return newState;
    case "GET_PATH_DATA":
      newState.pathData = pathData
      return newState;
    case "GET_OBJECT_DATA":
      newState.objectData = objectData
      return newState;
    case "SET_CLICKED_OBJECT":
      newState.selectedObject = payload;
      return newState
    default:
      return state;
  }
}

export const Context = createContext(initialState);

export default MyApp
