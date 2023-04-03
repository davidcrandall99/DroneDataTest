import bbox from '@turf/bbox';

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

    constructor(map, name, data) {
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
        this.tooltip = {}
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
}