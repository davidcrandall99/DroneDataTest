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
  paths: {},
  objects: {}
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
      newState.paths[payload.id] = payload.path
      return newState
    case "ADD_OBJECT_GROUP":
      newState.objects[payload.id] = payload.objectGroup
      return newState
    case "GET_PATH_DATA":
      newState.pathData = pathData
      return newState;
    case "GET_OBJECT_DATA":
      newState.objectData = objectData
      return newState;
    default:
      return state;
  }
}

export const Context = createContext(initialState);

export default MyApp
