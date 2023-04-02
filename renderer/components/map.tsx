import React, { useRef, useEffect, useState, Component } from 'react';
import maplibregl from 'maplibre-gl';
const paths = require('../mockData/paths.json');
const objects = require('../mockData/objects.json');
export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(null);
    const [lat, setLat] = useState(null);
    const [pitch, setPitch] = useState(0)
    const [zoom, setZoom] = useState(2);
    const [API_KEY] = useState(process.env.API_KEY); // api key for map tiles & styles; you can host your own locally, but for now, we'll use an external source

    const removeAllLayers = () => {
        if(map.current.getLayer(lineLayer.id)) map.current.removeLayer(lineLayer.id)
        if(map.current.getLayer(multiPathLayer.id)) map.current.removeLayer(multiPathLayer.id)
        if(map.current.getLayer(extrusionPathLayer.id)) map.current.removeLayer(extrusionPathLayer.id)
    }


/**
 * Single Line Data
 */
    // data of the single linestring path geometry -- connects all lng,lat data in a single string path
    const [linePathData, setLinePath] = useState({
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': []
        }
    });
    const getBounds = (coordinates) => {
        return coordinates.reduce((bounds, coord) => { return bounds.extend(coord)}, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
    }
    // line source
    const [lineSource, setLineSource] = useState({
        name: 'lineSource',
        data: {
            type: 'geojson',
            data: linePathData
        }
    })
    // the layer that uses the line source to render the line
    const [lineLayer, setLineLayer] = useState({
        'id': 'linePath',
        'type': 'line',
        'source': lineSource.name,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'red',
            'line-opacity': 0.5,
            'line-width': 1,
        }
    })

    
    const showLineLayer = () => {
        removeAllLayers()
        map.current.addLayer(lineLayer);
        const coordinates = linePathData.geometry.coordinates
        const bounds = getBounds(coordinates);
        map.current.fitBounds(bounds, {padding: 20, pitch: 0})
    }
    const removeLineLayer = () => {
        map.current.removeLayer(lineLayer)
    }



    const [multiPathData, setMultiPathData] = useState({
        'type': 'FeatureCollection',
        'features': []
    })

    const [multiPathSource, setMultiPathSource] = useState({
        name: 'multiPathSource', 
        data: {
            type: 'geojson',
            data: multiPathData
        }
    })

    const [multiPathLayer, setMultiPathLayer] = useState({
        'id': 'multiPath',
        'type': 'line',
        'source': multiPathSource.name,
        'paint': {
            'line-color': 'green',
            'line-opacity': 0.5,
            'line-width': 2,
        }
    })
    const showMultiPathLayer = () => {
        // removeAllLayers()
        const coordinates = linePathData.geometry.coordinates
        const bounds = getBounds(coordinates);
        map.current.fitBounds(bounds, {padding: 20, pitch: 20})
        map.current.addLayer(multiPathLayer)
        map.current.addLayer(extrusionPathLayer)

    }



/**
 * Single Line Extrusion Data Data
 */
    // extrusion collection -- contains an array of extrusion geometries
    const [extrusionPathData, setExtrusionPathData] = useState({
        'type': 'FeatureCollection',
        'features': []
    })

    // extrusion source -- uses the extrusion geometry data
    const [extrusionPathSource, setExtrusionPathSource] = useState({
        name: 'extrusionPathSource',
        data: {
            type: 'geojson',
            data: extrusionPathData  
        }
    })

    // the extrusion layer -- renders the extrustionPathSource on the map
    const [extrusionPathLayer, setExtrusionPathLayer] = useState({
        'id': 'pathExtrusion',
        'source': multiPathSource.name,
        // 'source-layer': 'extrusionPath',
        'type': 'fill-extrusion',
        'paint': {
            'fill-extrusion-color': '#fc1',
            'fill-extrusion-opacity': 0.5,
            'fill-extrusion-height': 0,
            'fill-extrusion-base':0,
            // 'fill-extrusion-vertical-gradient': true
            
        }
    })

    const showExtrusionLayer = () => {
        // removeAllLayers()
        const coordinates = linePathData.geometry.coordinates
        const bounds = getBounds(coordinates);
        const newPitch = 60
        map.current.addLayer(extrusionPathLayer);
        map.current.fitBounds(bounds, {padding: 20, pitch: newPitch})
        setPitch(newPitch)
        // console.log(map.current)
        
    }
    const removeExtrusionLayer = () => {
        map.current.removeLayer(lineLayer)
    }

    useEffect(() => {
        if (map.current) return; //stops map from intializing more than once
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false,
            // pitch
        });

        map.current.on('moveend', (e) => {
            const center = map.current.getCenter()
            setLat(center.lat);
            setLng(center.lng);
        })
        map.current.on('load', () => {

            // create a path source for the data
            map.current.addSource(extrusionPathSource.name, extrusionPathSource.data)
            map.current.addSource(lineSource.name, lineSource.data)
            map.current.addSource(multiPathSource.name, multiPathSource.data)

            const pathCoordinates = []
            // add all the paths to the path layer
            for (let i = 0; i in paths; i++) {

                let path = paths[i]; // the single path object
                let id = path.id
                let coordinates = [...path.coordinates]; // the coordinates
                let extrusionCoordinates = [...path.coordinates]; // the coordinates

                // get the last and next paths to connect extrusions
                const lastPathCoordinateGroup = pathCoordinates.length > 0 ? pathCoordinates[pathCoordinates.length - 1] : null;
                const lastCoordinate = lastPathCoordinateGroup ? lastPathCoordinateGroup[lastPathCoordinateGroup.length - 1] : null
                const nextCoordinate = i < paths.length - 2 ? paths[i + 1].coordinates[0] : null
                pathCoordinates.push(coordinates)
                if(lastCoordinate) {
                    extrusionCoordinates.unshift(lastCoordinate)
                }
                if(nextCoordinate) {
                    extrusionCoordinates.push(nextCoordinate)
                }

                let multiPathFeature = {
                    "type": 'Feature',
                    "id": path.id,
                    'geometry': {
                        type: 'MultiLineString',
                        coordinates: [coordinates]
                    },
                    properties: {
                        "id": path.id,
                        "altitude": `${path.altitude}ft`,
                        height: path.altitude,
                        // 'min-height': path.altitude-10,
                        'min-height': 0,
                    }
                }
                console.log(id, multiPathFeature)
                let altitudeFeature = {
                    "type": 'Feature',
                    "id": path.id,
                    'geometry': {
                        type: 'MultiLineString',
                        coordinates: [extrusionCoordinates]
                    },
                    style: { "stroke-width":"3"},
                    properties: {
                        "id": path.id,
                        "altitude": `${path.altitude}ft`,
                        height: path.altitude,
                        'min-height': path.altitude-10,
                    }
                }
                multiPathData.features.push(multiPathFeature)
                map.current.getSource(multiPathSource.name).setData(multiPathData)
                extrusionPathData.features.push(altitudeFeature)
                map.current.getSource(extrusionPathSource.name).setData(extrusionPathData)

            }
            linePathData.geometry.coordinates = pathCoordinates.flat(1)
            map.current.getSource(lineSource.name).setData(linePathData)

            // add line-hover action
            map.current.on('mouseenter', multiPathLayer.id, (e) => {
                console.log(e)
                let feature = e.features[0]
                let coordinates = feature.geometry.coordinates.slice();
                let properties = feature.properties

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                map.current.setPaintProperty(multiPathLayer.id, 'line-opacity', ['match', ['get', 'id'], properties.id, 1, 0.25])
                console.log(feature)
            });
            // add click event
            map.current.on('click', multiPathLayer.id, (e) => {
                let feature = e.features[0]
                let properties = feature.properties
                map.current.setPaintProperty(multiPathLayer.id, 'line-opacity', ['match', ['get', 'id'], properties.id, 1, 0.25])
                map.current.setPaintProperty(extrusionPathLayer.id, 'fill-extrusion-height', ['match', ['get', 'id'], properties.id, properties.height, 0])
            })
            // reset on doubleclick
            map.current.on('dblclick', () =>{
                map.current.setPaintProperty(multiPathLayer.id, 'line-opacity', 0.5)
            })
            
        })

    });

    

    return (
        <div className="w-full h-full absolute">
            <div className='w-full h-full' ref={mapContainer} />
            <div className="w-full fixed p-4 top-0 left-0 bg-black">
                <button>Menu</button>
            </div>
            <div className="w-25 h-25 bg-slate absolute bottom-0 left-0 z-10">
                <p>Lat: {lat}</p>
                <p>Lng: {lng}</p>
            </div>
            <div className="w-[250px] h-full bg-[rgba(0,0,0,0.5)] p-4 top-[55px] z-0 left-0 fixed text-white">
                {/* <button onClick={showLineLayer}>Show Path</button><br></br> */}
                <button onClick={showMultiPathLayer}>Show Path</button><br></br>
                {/* <button onClick={showExtrusionLayer}>Show Altitude</button> */}
            </div>
        </div>
    )
}

