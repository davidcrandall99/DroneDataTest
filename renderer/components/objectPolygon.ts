import maplibregl from 'maplibre-gl';
import bbox from '@turf/bbox';
import pointOnFeature from "@turf/point-on-feature";
import * as turf from "@turf/helpers";
import distance from "@turf/distance";
import { rootActions } from '../state';

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
    focusPoint;

    constructor(map, name, data, getStateFunction, dispatch) {
        this.dispatch = dispatch;
        this.state = getStateFunction;
        this.map = map;
        this.data = data;
        this.focusPoint = null;
        this.boundingBox  = null;
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
                "fill-extrusion-opacity": 0.8,
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": ["get", "base"]
            }
        }
        this.hoveredObject = null;
        this.clickedObject = null;
        this.map.addSource(this.objectSource.name, this.objectSource.data)
        this.setObjectsFromData(data)
        this.tooltip = null;
        this.createMapEvents()
    }
    setData(data) {
        this.data = data
    }
    setObjectsFromData(data = this.data) {
        this.objectData.features = []
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
                    base: object.base,
                    class: object.class ? object.class : null
                }
            }
            this.objectData.features.push(polygon)
        }
        this.map.getSource(this.objectSource.name).setData(this.objectData)
        this.boundingBox = bbox(this.objectData)
    }
    showLayer(fitBounds = false, pitch = 0, padding = 40) {
        if(!this.map.getLayer(this.objectLayer.id)) {
            this.map.addLayer(this.objectLayer)
        }
        if(fitBounds) {
            this.map.fitBounds(this.boundingBox, { padding, pitch })
        }
    }
    showAllObjects(){
        this.setObjectsFromData(this.data)
        this.showLayer()
    }
    removeObjects(){
        if(this.map.getLayer(this.objectLayer.id))
            this.map.removeLayer(this.objectLayer.id)
    }
    showObjectsNearPoint(point, zoomTo = true) {
        if(point) {
            this.focusPoint = point;
        }
        if(this.focusPoint){
            const objectsNearPoint = []
            for(let i = 0; i in this.data; i++) {
                let object = this.data[i]
                let polygon = turf.polygon(object.coordinates)
                let polygonPoint = pointOnFeature(polygon)
                let distanceFrom = distance(polygonPoint, point)
                if (distanceFrom < 2) {
                    objectsNearPoint.push(object)
                }
            }
            this.setObjectsFromData(objectsNearPoint)
            this.showLayer(zoomTo, 30)
        }
    }

    createMapEvents() {
        this.map.on("mouseenter", this.objectLayer.id, (e) => {
            this.hoveredObject = e.features[0]
            this.map.getCanvas().style.cursor = 'pointer';
            if(this.clickedObject && this.hoveredObject.properties.id !== this.clickedObject.properties.id) {
                this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", [
                    "match",
                    ["get", "id"],
                    this.hoveredObject.properties.id,
                    "#0FF",
                    this.clickedObject.properties.id,
                    "#FA0",
                    "#0CF"
                ])
            } else {
                this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", [
                    "match",
                    ["get", "id"],
                    this.hoveredObject.properties.id,
                    "#0FF",
                    "#0CF"
                ])
            }
        })
        this.map.on("mouseleave", this.objectLayer.id, (e) => {
            this.hoveredObject = null;
            this.map.getCanvas().style.cursor = ''
            if(this.clickedObject) {
                this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", [
                    "match",
                    ["get", "id"],
                    this.clickedObject.properties.id,
                    "#FA0",
                    "#0CF"
                ])
            } else {
                this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", "#0CF")
            }
        })
        this.map.on("click", this.objectLayer.id, (e) => {
            const feature = e.features[0];
            this.clickedObject = feature;
            this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", [
                "match",
                ["get", "id"],
                feature.properties.id,
                "#FA0",
                "#0CF"
            ])
            this.dispatch({
                type: rootActions.object.SET_CLICKED_OBJECT,
                payload: feature
            })
        })
    }

    clearSelections() {
        if(this.tooltip) {
            this.tooltip.remove()
        }
        if(this.clickedObject) {
            this.clickedObject = null;
            this.dispatch({
                type: rootActions.object.SET_CLICKED_OBJECT,
                payload: null
            })
        }
        this.map.setPaintProperty(this.objectLayer.id, "fill-extrusion-color", "#0CF")
    }

    addToolTip(feature, html) {
        const point = pointOnFeature(feature);
        const properties = feature.properties;
        if (!this.tooltip) {
            this.tooltip = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: false,
            });
        }
        if(!html) {
        html = `
            <p>
                <b>Object ID:</b> ${properties.id}<br>
                <b>Altitude:</b> ${properties.height}
            </p>
        `;
        }
        if(point.geometry.coordinates.length == 2) {
            this.tooltip.setLngLat(point.geometry.coordinates).setHTML(html).addTo(this.map)
        }
    }
}