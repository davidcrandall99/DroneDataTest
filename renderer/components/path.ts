import maplibregl from "maplibre-gl";
import { ExtrusionLayer } from "./extrusion";
export class PathGroup {
  pathData;
  pathSource;
  pathLayer;
  pathCoordinates;
  map;
  name;
  hoveredLine;
  clickedLine;
  extrusion;
  data;

  constructor(map, name, data) {
    this.map = map;
    this.name = name;
    this.data = data;
    this.pathCoordinates = []
    this.pathData = {
        'type': 'FeatureCollection',
        'features': []
    };
    this.pathSource = {
        name: `${name}Source`,
        data: { 
            type: 'geojson',
            data: this.pathData
        }
    };
    this.pathLayer = {
        id: name,
        type: 'line',
        source: this.pathSource.name,
        paint: {
            'line-color': 'green',
            'line-opacity': 0.5,
            'line-width': 2
        }
    }
    this.hoveredLine = null;
    this.clickedLine = null;
    this.extrusion = new ExtrusionLayer(map, `${name}Extrusion`)
    this.setPathsFromData(data)
  }
  addSourceToMap() {
    this.map.addSource(this.pathSource.name, this.pathSource.data)
  }
  setPathsFromData(data) {
    this.addSourceToMap()
    for (let i = 0; i in data; i++) {
      let path = data[i]; // the single path object
      let coordinates = [...path.coordinates]; // the coordinates
      let extrusionCoordinates = [...path.coordinates]; // the coordinates

      // get the last and next paths to connect extrusions
      const lastPathCoordinateGroup =
        this.pathCoordinates.length > 0
          ? this.pathCoordinates[this.pathCoordinates.length - 1]
          : null;
      const lastCoordinate = lastPathCoordinateGroup
        ? lastPathCoordinateGroup[lastPathCoordinateGroup.length - 1]
        : null;
      const nextCoordinate =
        i < data.length - 2 ? data[i + 1].coordinates[0] : null;
      this.pathCoordinates.push(coordinates);
      if (lastCoordinate) {
        extrusionCoordinates.unshift(lastCoordinate);
      }
      if (nextCoordinate) {
        extrusionCoordinates.push(nextCoordinate);
      }

      let multiPathFeature = {
        type: "Feature",
        id: path.id,
        geometry: {
          type: "MultiLineString",
          coordinates: [coordinates],
        },
        properties: {
          id: path.id,
          altitude: `${path.altitude}ft`,
          height: path.altitude,
          // 'min-height': path.altitude-10,
          "min-height": 0,
        },
      };
    //   let altitudeFeature = {
    //     type: "Feature",
    //     id: path.id,
    //     geometry: {
    //       type: "MultiLineString",
    //       coordinates: [extrusionCoordinates],
    //     },
    //     style: { "stroke-width": "3" },
    //     properties: {
    //       id: path.id,
    //       altitude: `${path.altitude}ft`,
    //       height: path.altitude,
    //       "min-height": path.altitude - 10,
    //     },
    //   };
      this.pathData.features.push(multiPathFeature);
      this.map.getSource(this.pathSource.name).setData(this.pathData);
    //   extrusionPathData.features.push(altitudeFeature);
    //   this.map
    //     .getSource(extrusionPathSource.name)
    //     .setData(extrusionPathData);
    }
  }
  createMapEvents() {
    this.map.on('mouseenter', this.pathLayer.id, (e) => {
        let feature = e.features[0]
        let coordinates = feature.geometry.coordinates.slice();
        let properties = feature.properties
        if (!this.hoveredLine || this.hoveredLine.properties.id !== properties.id) {
            this.hoveredLine = feature;
            // dispatch({ type: "SET_HOVERED_LINE_ID", payload: hoveredLine })
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            if(this.clickedLine && this.hoveredLine && this.hoveredLine.properties.id !== this.clickedLine.properties.id) {
                this.map.setPaintProperty(
                    this.pathLayer.id,
                    'line-opacity',
                    ["match", ["get", "id"], this.hoveredLine.properties.id, 1, this.clickedLine.properties.id, 1, 0.25])
            } else {
                this.map.setPaintProperty(
                    this.pathLayer.id,
                    'line-opacity',
                    ["match", ["get", "id"], properties.id, 1, 0.25])
            }

        }
    })
    this.map.on('click', ()=> {
        // this.map.setFilter(extrusionPathLayer.id, ['==', 'id', hoveredLine])
        // let properties = feature.properties
        this.clickedLine = this.hoveredLine;
        // dispatch({ type: "SET_CLICKED_LINE_ID", payload: hoveredLine })
        if(this.clickedLine) {
            this.map.setPaintProperty(this.pathLayer.id, 'line-opacity', ['match', ['get', 'id'], this.hoveredLine.properties.id, 1, 0.25])
            console.log(this.clickedLine)
            this.extrusion.updateCoordinates(this.clickedLine, this.clickedLine.properties.id)
            this.extrusion.addLayer()
        }
        else {
            this.map.setPaintProperty(this.pathLayer.id, 'line-opacity', 0.5)
        }  
    })
  }
  showLayer() {
    this.map.addLayer(this.pathLayer)
    this.createMapEvents()
  }
}
