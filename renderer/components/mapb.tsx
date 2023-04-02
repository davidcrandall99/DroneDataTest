import React, { useRef, useEffect, useState, Component } from 'react';
import maplibregl from 'maplibre-gl';
const paths = require('../mockData/paths.json');
const objects = require('../mockData/objects.json');
export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-96.44588294255948);
    const [lat, setLat] = useState(34.01767376293214);
    const [zoom, setZoom] = useState(15);
    const [API_KEY] = useState(process.env.API_KEY);

    useEffect(() => {
        if (map.current) return; //stops map from intializing more than once
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false
        });

        map.current.on('moveend', (e) => {
            const center = map.current.getCenter()
            setLat(center.lat);
            setLng(center.lng);
        })
        map.current.on('load', () => {
            // create an object for each path
            const pathData = {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            }
            // create a path source for the data
            map.current.addSource('path', {
                type: 'geojson',
                data: pathData
            })

            // // add the path layer to the map
            map.current.addLayer({
                'id': 'path',
                'type': 'line',
                'source': 'path',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': 'red',
                    'line-width': 1,
                }
            });
            // add extrusion for the path
            // map.current.addLayer({
            //     'id': 'pathExtrusion',
            //     'source': 'path',
            //     // 'source-layer': 'path',
            //     'type': 'fill-extrusion',
            //     'paint': {
            //         'fill-extrusion-color': '#ff0',
            //         'fill-extrusion-opacity': 1,
            //         // 'fill-extrusion-base': 0.5,
            //         'fill-extrusion-height': ["get", "height"],
            //         'fill-extrusion-base': ["get", "alt"]
                    
            //     }
            // })
            // add all the paths to the path layer
            const pathCoordinates = []
            for (let i = 0; i in paths; i++) {

                let path = paths[i];
                pathCoordinates.push(path.coordinates)
                // coordinates.forEach(n => n.push(path.altitude))
                // let feature = {
                //     type: 'Feature',
                //     // id: path.id,
                //     'geometry': {
                //         type: 'LineString',
                //         coordinates
                //     },
                //     properties: {
                //         "id": path.id,
                //         "altitude": `${path.altitude}ft`,
                //         height: path.altitude,
                //         'min-height': path.altitude - 20,
                //     }
                // }
                
                // pathData.geometry.coordinates.push(coordinates)
            }
            // let flattenedCoordinates = coordinates.flat(1);
            pathData.geometry.coordinates= pathCoordinates.flat(1)
            map.current.getSource('path').setData(pathData)
            const lineGeometry = map.current.getSource('path')._data.geometry.coordinates;
            const last = lineGeometry.length - 1;
            if (lineGeometry[0][0] !== lineGeometry[last][0] || lineGeometry[0][1] !== lineGeometry[last][1]) {
                lineGeometry.push(lineGeometry[0]);
            }
            map.current.addSource('poly',{
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [lineGeometry]
                    }
                }
            })
            map.current.addLayer({
                'id': 'pathExtrusion',
                'source': 'poly',
                // 'source-layer': 'path',
                'type': 'fill-extrusion',
                'paint': {
                    'fill-extrusion-color': '#ff0',
                    'fill-extrusion-opacity': 1,
                    // 'fill-extrusion-base': 0.5,
                    // 'fill-extrusion-height': ["get", "height"],
                    // 'fill-extrusion-base': ["get", "alt"]
                    
                }
            })


        })

    });

    return (
        <div className="w-full h-full absolute">
            <div className='w-full h-full' ref={mapContainer} />
            <div className="w-25 h-25 bg-slate absolute top-0 left-0">
                <p>Lat: {lat}</p>
                <p>Lng: {lng}</p>
            </div>
        </div>
    )
}

