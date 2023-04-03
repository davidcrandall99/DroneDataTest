export class ExtrusionLayer {
    map;
    source;
    pathData;
    coordinates;
    properties;
    feature;
    layer;
    constructor(map, name, id?, coordinates = []) {
        this.map = map;
        this.coordinates = coordinates
        this.properties = {}
        this.pathData = {
            id,
            'type': 'LineString',
            coordinates
        }
        this.source = {
            name: `${name}Source`,
            data: {
                type: 'geojson',
                data: this.pathData
            }
        }
        // this.feature = {
        //     type: "Feature",
        //     id: id ? id : 'extrusion',
        //     geometry: this.pathData
        // }
        this.layer = {
            id: name,
            source: this.source.name,
            type: 'fill-extrusion',
            paint: {
                'fill-extrusion-color': '#fc1',
                'fill-extrusion-opacity': 0.5,
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min-height'],
                // 'fill-extrusion-vertical-gradient': true
    
            }
        }
        this.map.addSource(this.source.name, this.source.data)
    }
    updateCoordinates(pathData, id) {
        this.pathData = pathData;
        this.map.getSource(this.source.name).setData(this.pathData)
    }
    addLayer() {
        if(this.map.getLayer(this.layer.id)) {
            return;
        }
        if(!this.map.getSource(this.source.name)) {
            this.map.addSource(this.source.name, this.source.data)
        }
        this.map.addLayer(this.layer)
    }
}