import React, {useContext, useEffect} from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Map from '../components/map';
import Menu from '../components/menu';
import { Context } from '../pages/_app';


function Home() {
  const [state, dispatch] = useContext(Context)
  useEffect(()=> {
    dispatch({ type: "GET_PATH_DATA"})
    dispatch({ type: "GET_OBJECT_DATA"})
  }, [state.pathData, state.objectData])
  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-tailwindcss)</title>
      </Head>
      <Menu />
      <Map />

    </React.Fragment>
  );
}

export default Home;
