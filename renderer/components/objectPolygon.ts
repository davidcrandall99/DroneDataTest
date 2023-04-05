import maplibregl from 'maplibre-gl';
import bbox from '@turf/bbox';
import pointOnFeature from "@turf/point-on-feature";

export class ObjectPolygon {
    data;
    objectData;
    objectSource;
    objectLayer;
    objectCoordinates;
    map;
    name;
    hoveredObject;
    clickedObject;
    boundingBox;
    tooltip;
    dispatch;
    state;

    constructor(map, name, data, getStateFunction, dispatch) {
        this.dispatch = dispatch;
        this.state = getStateFunction;
        this.map = map;
        this.data = data;
        this.objectCoordinates = [];
        this.objectData = {
            type: "FeatureCollection",
            features: []
        }
        this.objectSource = {
            name: `${name}Source`,
            data: {
                type: "geojson",
                data: this.objectData
            }
        }
        this.objectLayer = {
            id: name,
            type: "fill-extrusion",
            source: this.objectSource.name,
            paint: {
                "fill-extrusion-color": "#0CF",
                "fill-extrusion-opacity": 0.5,
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "base"]
            }
        }
        this.hoveredObject = null;
        this.clickedObject = null;
        this.map.addSource(this.objectSource.name, this.objectSource.data)
        this.setObjectsFromData(data)
        this.boundingBox = bbox(this.objectData)
        this.tooltip = null;
        this.createMapEvents()
    }
    setObjectsFromData(data) {
        for (let i = 0; i in data; i++) {
            let object = data[i]
            let polygon = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: object.coordinates
                },
                properties: {
                    id: object.id,
                    height: object.height,
                    base: object.base
                }
            }
            this.objectData.features.push(polygon)
        }
        this.map.getSource(this.objectSource.name).setData(this.objectData)
    }
    showLayer(fitBounds = false, pitch = 0, padding = 40) {
        if(!this.map.getLayer(this.objectLayer.id)) {
            this.map.addLayer(this.objectLayer)
        }
        if(fitBounds) {
            this.map.fitBounds(this.boundingBox, { padding, pitch })
        }
    }

    createMapEvents() {
        this.map.on("click", this.objectLayer.id, (e) => {
            const feature = e.features[0];
            this.addToolTip(feature)
            this.dispatch({
                type:"SET_CLICKED_OBJECT",
                payload: feature
            })
        })
    }

    addToolTip(feature) {
        const point = pointOnFeature(feature);
        const properties = feature.properties;
        if (!this.tooltip) {
            this.tooltip = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: false,
            });
        }
        let html = `
            <p>
                <b>Object ID:</b> ${properties.id}<br>
                <b>Altitude:</b> ${properties.height}
            </p>
        `;
        if(point.geometry.coordinates.length == 2) {
            this.tooltip.setLngLat(point.geometry.coordinates).setHTML(html).addTo(this.map)
        }
    }
}