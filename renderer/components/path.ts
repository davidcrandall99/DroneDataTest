import bbox from "@turf/bbox";
import * as turf from "@turf/helpers";
import distance from "@turf/distance";
import pointOnFeature from "@turf/point-on-feature";
import maplibregl from "maplibre-gl";
import { ObjectPolygon } from "./objectPolygon";
import { ExtrusionLayer } from "./extrusion";
import { rootActions } from "../state";
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
  linestrings;
  dispatch;
  state;
  showingObjects;

  constructor(map, name, data, getStateFunction, dispatch) {
    this.dispatch = dispatch;
    this.map = map;
    this.name = name;
    this.data = data;
    this.showingObjects = false;
    this.pathCoordinates = [];
    this.linestrings = [];

    for (let i = 0; i in data; i++) {
      let path = data[i]; // the single path object
      // multiline string
      let linestring = turf.lineString(path.coordinates, {
        id: path.id,
        altitude: `${path.altitude}ft`,
        height: path.altitude,
        "min-height": path.altitude - 100,
      });
      this.linestrings.push(linestring);
    }

    (this.pathData = turf.featureCollection(this.linestrings, { id: "123" })),
      (this.pathSource = {
        name: `${name}Source`,
        data: {
          type: "geojson",
          data: this.pathData,
        },
      });
    this.pathLayer = {
      id: name,
      type: "line",
      source: this.pathSource.name,
      paint: {
        "line-color": "green",
        "line-opacity": 0.5,
        "line-width": 1,
      },
    };
    this.hoveredLine = null;
    this.clickedLine = null;
    this.extrusion = new ExtrusionLayer(map, `${name}Extrusion`);
    // this.setPathsFromData(data);
    this.boundingBox = bbox(this.pathData);
    this.addSourceToMap();
    this.tooltip = null;
  }
  addSourceToMap() {
    this.map.addSource(this.pathSource.name, this.pathSource.data);
  }
  showObjectsNearPoint() {
    const line = this.clickedLine
      ? this.clickedLine
      : turf.lineString(this.pathData);
    const point = pointOnFeature(line);
    this.dispatch({
      type: rootActions.object.SHOW_OBJECT_LAYER,
      payload: point,
    });
    this.showingObjects = true;
  }
  createMapEvents() {
    this.map.on("mousemove", 'path', (e) => {
      if (this.hoveredLine) {
        let hoveredLngLat = [e.lngLat.lng, e.lngLat.lat];
        let hoveredPoint = pointOnFeature(this.hoveredLine);
        let distanceFrom = distance(hoveredLngLat, hoveredPoint);
        if (this.pathLayer) {
          if (distanceFrom >= 2) {
            this.hoveredLine = null;
            this.map.getCanvas().style.cursor = "";
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
      }
    });
    this.map.on("mouseenter", this.pathLayer.id, (e) => {
      if (this.showingObjects) {
        return;
      }
      
      let feature = e.features[0];
      let coordinates = feature.geometry.coordinates.slice();
      this.map.getCanvas().style.cursor = "pointer";
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
      if (this.showingObjects || !this.map.getLayer(this.pathLayer.id)) return;
      if (this.hoveredLine) {
        this.clickedLine = this.hoveredLine;
        this.dispatch({
          type: rootActions.path.SET_CLICKED_PATH,
          payload: this.clickedLine,
        });
      }
      if (this.clickedLine) {
        let clickedLngLat = [e.lngLat.lng, e.lngLat.lat];
        let linePoint = pointOnFeature(this.clickedLine);
        let distanceFromClick = distance(clickedLngLat, linePoint);
        if (distanceFromClick >= 2) {
          this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
          this.clickedLine = null;
          this.dispatch({
            type: rootActions.path.SET_CLICKED_PATH,
            payload: null,
          });
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
      } else {
        this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
      }
    });
  }
  addToolTip(line) {
    let properties = line.properties;
    if (!this.tooltip) {
      this.tooltip = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
      });
    }
    // find the middle coordinate
    let middle = pointOnFeature(line);
    let html = `
        <p>
            <b>Path ID:</b> ${properties.id}<br>
            <b>Altitude:</b> ${properties.altitude}<br>
            <button id="tooltipBtn">Show Nearby Objects</button>
        </p>
    `;
    this.tooltip
      .setLngLat(middle.geometry.coordinates)
      .setHTML(html)
      .addTo(this.map);
    document.getElementById("tooltipBtn").onclick = () => {
      this.showObjectsNearPoint();
    };
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
  removeLayer() {
    this.map.removeLayer(this.pathLayer.id);
    if (this.extrusion) {
      this.removeExtrusion();
    }
  }
  clearSelections() {
    this.dispatch({ type: rootActions.path.SET_CLICKED_PATH, payload: null });
    this.dispatch({
      type: rootActions.object.HIDE_OBJECT_LAYER,
      payload: null,
    });
    this.hoveredLine = null;
    this.clickedLine = null;
    this.showingObjects = false;
    if (this.extrusion) {
      this.removeExtrusion();
    }
    this.map.setPaintProperty(this.pathLayer.id, "line-opacity", 0.5);
  }
  setShowingObjects(val) {
    this.showingObjects = val;
  }
}
