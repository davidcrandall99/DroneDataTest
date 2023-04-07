import React, {useContext, useEffect} from 'react';
import Head from 'next/head';
import Map from '../components/map';
import { rootActions } from '../state';
import { Context } from '../pages/_app';
import electron from 'electron';
let ipcRenderer = electron.ipcRenderer;
const objectData = require("../mockData/objects.json");
function Home() {
  const [state, dispatch] = useContext(Context)
  useEffect(()=> {

    ipcRenderer.on('saveObjectData', (event, data) => {
      dispatch({ type: rootActions.object.SET_OBJECT_DATA, payload: data})
    })
    ipcRenderer.on('getObjectData', (event, data) => {
      dispatch({ type: rootActions.object.SET_OBJECT_DATA, payload: data})
    })
    dispatch({ type: rootActions.object.GET_OBJECT_DATA})  
    dispatch({ type: rootActions.path.GET_PATH_DATA})    
  }, [])
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-tailwindcss)</title>
      </Head>
      <Map />

    </React.Fragment>
  );
}

export default Home;
