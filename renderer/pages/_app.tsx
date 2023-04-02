import React, { createContext, useReducer } from 'react';
import type { AppProps } from 'next/app';

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
  activeMapLayers: [],
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
    default:
      return state;
  }
}

export const Context = createContext(initialState);

export default MyApp
