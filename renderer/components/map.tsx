import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { Context } from '../pages/_app';
import { PathGroup } from './path';
import maplibregl from 'maplibre-gl';
const pathsData = require('../mockData/paths.json');
const objectsData = require('../mockData/objects.json');



export default function Map() {


    const [state, dispatch] = useContext(Context)
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [API_KEY] = useState(process.env.API_KEY); // api key for map tiles & styles; you can host your own locally, but for now, we'll use an external source

    const getBounds = (coordinates) => {
        return coordinates.reduce((bounds, coord) => { return bounds.extend(coord) }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
    }

    const [paths, setPaths] = useState(null)

    const showPath = () => {
        if(setPaths !== null) {
            paths.showLayer()
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
            setPaths(new PathGroup(map.current, 'pathGroup', pathsData))
        })

    }, [paths]);



    return (
        <div className="w-full h-full absolute">
            <div className='w-full h-full' ref={mapContainer} />
            <div className="w-full fixed p-4 top-0 left-0 bg-black">
                <button>Menu</button>
            </div>
            <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
                <p>Lat: {state.lat}</p>
                <p>Lng: {state.lng}</p>
            </div>
            <div className="w-[250px] h-full bg-[rgba(0,0,0,0.5)] p-4 top-[55px] z-0 left-0 fixed text-white">
                {paths !== null &&
                    <button onClick={showPath}>Show Path</button>
                }
            </div>
        </div>
    )
}

