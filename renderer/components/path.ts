import bbox from "@turf/bbox";
import distance from "@turf/distance";
import pointOnFeature from "@turf/point-on-feature";
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
  boundingBox;
  tooltip;

  constructor(map, name, data) {
    this.map = map;
    this.name = name;
    this.data = data;
    this.pathCoordinates = [];
    this.pathData = {
      type: "FeatureCollection",
      features: [],
    };
    this.pathSource = {
      name: `${name}Source`,
      data: {
        type: "geojson",
        data: this.pathData,
      },
    };
    this.pathLayer = {
      id: name,
      type: "line",
      source: this.pathSource.name,
      paint: {
        "line-color": "green",
        "line-opacity": 0.5,
        "line-width": 2,
      },
    };
    this.hoveredLine = null;
    this.clickedLine = null;
    this.extrusion = new ExtrusionLayer(map, `${name}Extrusion`);
    this.setPathsFromData(data);
    this.boundingBox = bbox(this.pathData);
    this.tooltip = null;
  }
  addSourceToMap() {
    this.map.addSource(this.pathSource.name, this.pathSource.data);
  }
  setPathsFromData(data) {
    this.addSourceToMap();
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
          "min-height": path.altitude - 100,
        },
      };

      this.pathData.features.push(multiPathFeature);
      this.map.getSource(this.pathSource.name).setData(this.pathData);
    }
  }
  createMapEvents() {
    this.map.on("mousemove", (e) => {
      if (this.hoveredLine) {
        let hoveredLngLat = [e.lngLat.lng, e.lngLat.lat];
        let hoveredPoint = pointOnFeature(this.hoveredLine);
        let distanceFrom = distance(hoveredLngLat, hoveredPoint);
        if (distanceFrom >= 2) {
          this.hoveredLine = null
          this.map.getCanvas().style.cursor = ''
          if (!this.clickedLine) {
            this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
          } else {
            this.map.setPaintProperty(this.pathLayer.id, "line-opacity", [
              "match",
              ["get", "id"],
              this.clickedLine.properties.id,
              1,
              0.25,
            ]);
          }
        }
      }
    });
    this.map.on("mouseenter", this.pathLayer.id, (e) => {
      let feature = e.features[0];
      let coordinates = feature.geometry.coordinates.slice();
      this.map.getCanvas().style.cursor = 'pointer';
      let properties = feature.properties;
      if (
        !this.hoveredLine ||
        this.hoveredLine.properties.id !== properties.id
      ) {
        this.hoveredLine = feature;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        if (
          this.clickedLine &&
          this.hoveredLine &&
          this.hoveredLine.properties.id !== this.clickedLine.properties.id
        ) {
          this.map.setPaintProperty(this.pathLayer.id, "line-opacity", [
            "match",
            ["get", "id"],
            this.hoveredLine.properties.id,
            1,
            this.clickedLine.properties.id,
            1,
            0.25,
          ]);
        } else {
          this.map.setPaintProperty(this.pathLayer.id, "line-opacity", [
            "match",
            ["get", "id"],
            properties.id,
            1,
            0.25,
          ]);
        }
      }
    });
    this.map.on("click", (e) => {
      if(this.hoveredLine) {
        this.clickedLine = this.hoveredLine;
      }
      if (this.clickedLine) {

        let clickedLngLat = [e.lngLat.lng, e.lngLat.lat];
        let linePoint = pointOnFeature(this.clickedLine);
        let distanceFromClick = distance(clickedLngLat, linePoint);
        if (distanceFromClick >= 2) {
          this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
          this.clickedLine = null;
          this.hoveredLine = null;
          this.removeExtrusion();
          this.removeToolTip();
          return;
        }

        this.map.setPaintProperty(this.pathLayer.id, "line-opacity", [
          "match",
          ["get", "id"],
          this.hoveredLine.properties.id,
          1,
          0.25,
        ]);
        this.extrusion.updateCoordinates(
          this.clickedLine,
          this.clickedLine.properties.id
        );
        this.extrusion.addLayer();
        this.addToolTip(this.clickedLine);
      } else {
        this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
      }
    });
  }
  addToolTip(line) {
    let coordinates = line.geometry.coordinates;
    let properties = line.properties;
    if (!this.tooltip) {
      this.tooltip = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
      });
    }
    // find the middle coordinate
    let middle =
      coordinates.flat()[0] == 2
        ? coordinates.flat().slice(Math.ceil(coordinates.length / 2))[0]
        : coordinates.slice(Math.ceil(coordinates.length / 2))[0];
    let html = `
        <p>
            <b>Drone ID:</b> ${properties.id}<br>
            <b>Altitude:</b> ${properties.altitude}
        </p>
    `;
    this.tooltip.setLngLat(middle).setHTML(html).addTo(this.map);
  }
  removeToolTip() {
    if (this.tooltip) this.tooltip.remove();
  }
  removeExtrusion() {
    if (this.map.getLayer(this.extrusion.layer.id))
      this.map.removeLayer(this.extrusion.layer.id);
  }
  showLayer(pitch = 0, padding = 40) {
    if (!this.map.getLayer(this.pathLayer.id)) {
      this.map.addLayer(this.pathLayer);
      this.createMapEvents();
    }
    this.map.fitBounds(this.boundingBox, { padding, pitch });
  }
}
