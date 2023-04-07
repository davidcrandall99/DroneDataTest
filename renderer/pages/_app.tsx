import React, { createContext, useReducer } from 'react';
import type { AppProps } from 'next/app';
import { rootState, rootReducer } from '../state';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [state, dispatch] = useReducer(rootReducer, rootState);
  return (
    <Context.Provider value={[state, dispatch]}>
      <Component {...pageProps} />
    </Context.Provider>
  );
}
export const Context = createContext(rootState);

export default MyApp
