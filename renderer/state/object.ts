import Store from "electron-store";
const store = new Store();
import electron from "electron";
let ipcRenderer = electron.ipcRenderer;
const objectData = require("../mockData/objects.json");
import { rootActions } from ".";

export const initialObjectState: any = {
  objectData: null,
  objects: null,
  objectsShown: false,
  selectedObject: null,
  editingObjectClass: false,
  selectedObjectClass: null,
  objectClasses: {
    friendly: {
      label: "Friendly",
      value: "friendly",
      color: "green"
    },
    building: {
      label: "Building Of Interest",
      value: "building",
      color: "yellow"
    },
    vehicle: {
      label: "Vehicle Of Interest",
      value: "vehicle",
      color: "magenta"
    },
    other: {
      label: "Other",
      value: "other",
      color: "turquoise"
    },
    unknown: {
      label: "Unknown",
      value: "unknown",
      color: "lightgrey"
    }
  },
};

// Actions
export const OBJECTS = {
  SET_OBJECT_DATA: "SET_OBJECT_DATA",
  GET_OBJECT_DATA: "GET_OBJECT_DATA",
  SET_CLICKED_OBJECT: "SET_CLICKED_OBJECT",
  ADD_OBJECT_GROUP: "ADD_OBJECT_GROUP",
  SHOW_OBJECT_LAYER: "SHOW_OBJECT_LAYER",
  SHOW_ALL: "SHOW_ALL",
  SET_OBJECTS_SHOWN: "SET_OBJECTS_SHOWN",
  SET_SELECTED_OBJECT_CLASS: "SET_SELECTED_OBJECT_CLASS",
  EDITING_OBJECT_CLASS: "EDITING_OBJECT_CLASS",
  SAVE_OBJECT_DATA: "SAVE_OBJECT_DATA",
  HIDE_OBJECT_LAYER: "HIDE_OBJECT_LAYER",
};


const writeObjectData = (data) => {
  const dataString = JSON.stringify(data);
  ipcRenderer.send("saveObjectData", dataString);
};

export const ObjectReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const payload = action.payload;
  switch (action.type) {
    // sets data that has been fetched
    case OBJECTS.SET_OBJECT_DATA:
      if (payload) {
        if (typeof payload == "string")
          newState.objectData = JSON.parse(payload);
        else newState.objectData = payload;
      }
      else writeObjectData(objectData)
      return newState;
    // fetches data
    case OBJECTS.GET_OBJECT_DATA:
      if (!newState.objectData) {
        ipcRenderer.send("getObjectData");
      }
      return newState;
    case OBJECTS.SET_CLICKED_OBJECT:
      if (payload == null) {
        newState.objects.clearSelections();
      }
      newState.selectedObjectClass = null;
      newState.selectedObject = payload;
      return newState;
    case OBJECTS.ADD_OBJECT_GROUP:
      newState.objects = payload;
      return newState;
    case OBJECTS.SHOW_ALL:
      newState.objects.setData(newState.objectData)
      newState.objects.setObjectsFromData()
      newState.objects.showLayer(true)
      newState.objects.dispatch({ type: rootActions.path.SHOWING_ALL_OBJECTS, payload: true })
      newState.objectsShown = true;
      return newState;
    case OBJECTS.SHOW_OBJECT_LAYER:
      if (payload) {
        newState.objects.showObjectsNearPoint(payload);
      } else {
        newState.objects.showLayer(true);
      }
      newState.objectsShown = true;
      return newState;
    case OBJECTS.SET_OBJECTS_SHOWN:
      newState.objectsShown = payload;
      return newState;
    case OBJECTS.SET_SELECTED_OBJECT_CLASS:
      const newClass = newState.objectClasses[payload]
      newState.selectedObjectClass = newClass ? newClass : newState.objectClasses.unknown
      return newState;
    case OBJECTS.EDITING_OBJECT_CLASS:
      if (!payload) {
        newState.selectedObjectClass = null;
      }
      newState.editingObjectClass = payload;
      return newState;
    case OBJECTS.SAVE_OBJECT_DATA:
      let classObject = newState.objectClasses[newState.selectedObjectClass.value] ? newState.objectClasses[newState.selectedObjectClass.value] : newState.objectClasses.unknown;
      for (let i in newState.objectData) {
        if (
          newState.selectedObject.properties.id == newState.objectData[i].id
        ) {
          newState.objectData[i]["class"] = classObject.value;
        }
      }
      store.set("objects", newState.objectData);
      writeObjectData(newState.objectData);

      let currentData = newState.objects.getCurrentData()
      for (let i in currentData) {
        if (
          newState.selectedObject.properties.id == currentData[i].id
        ) {
          currentData[i]["class"] = classObject.value;
          currentData[i]["color"] = classObject.color;
        }
      }

      newState.objects.setData(currentData);
      newState.objects.setObjectsFromData()
      if (newState.objects.focusPoint) {
        newState.objects.showObjectsNearPoint(
          newState.objects.focusPoint,
          false
        );
      }
      newState.selectedObject.properties.class = classObject.value
      newState.selectedObjectClass = null;
      newState.editingObjectClass = false;
      return newState;
    case OBJECTS.HIDE_OBJECT_LAYER:
      newState.objects.removeObjects();
      newState.selectedObjects = null;
      newState.objectsShown = false;
      return newState;
    default:
      return state;
  }
};
