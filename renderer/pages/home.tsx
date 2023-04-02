import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Map from '../components/map';

function Home() {
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
