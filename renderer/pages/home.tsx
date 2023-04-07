import React, {useContext, useEffect} from 'react';
import Head from 'next/head';
import Map from '../components/map';
import { rootActions } from '../state';
import { Context } from '../pages/_app';


function Home() {
  const [state, dispatch] = useContext(Context)
  useEffect(()=> {
    dispatch({ type: rootActions.path.GET_PATH_DATA})
    dispatch({ type: rootActions.object.GET_OBJECT_DATA})
  }, [state.path.pathData, state.object.objectData])
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
