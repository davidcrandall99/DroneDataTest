const pathData = require("../mockData/paths.json");

export const initialPathState: any = {
  clickedLineId: null,
  hoveredLineId: null,
  pathData: null,
  paths: null,
  pathsShown: false,
  selectedPath: null,
};

// actions
export const PATH = {
    GET_PATH_DATA: "GET_PATH_DATA",
    SHOW_PATH: "SHOW_PATH",
    HIDE_PATH: "HIDE_PATH",
    SET_CLICKED_LINE_ID: "SET_CLICKED_LINE_ID",
    SET_HOVERED_LINE_ID: "SET_HOVERED_LINE_ID",
    ADD_DRONE_PATH: "ADD_DRONE_PATH",
    SET_CLICKED_PATH: "SET_CLICKED_PATH",
    CLEAR_LINE_SELECTIONS: "CLEAR_LINE_SELECTIONS",
    SHOW_OBJECTS_NEAR_PATH: "SHOW_OBJECTS_NEAR_PATH",
    SHOWING_ALL_OBJECTS: "SHOWING_ALL_OBJECTS"

}

export const PathRecuder = (state, action) => {
  const newState = Object.assign({}, state);
  const payload = action.payload;
  switch (action.type) {
    case PATH.GET_PATH_DATA:
      newState.pathData = pathData;
      return newState;
    case PATH.SHOW_PATH:
      if (newState.paths != null) {
        newState.paths.showLayer(30);
        newState.pathsShown = true;
      }
      return newState;
    case PATH.HIDE_PATH: 
      newState.paths.removeLayer()
      newState.selectedPath = null;
      newState.hoveredLine = null;
      newState.clickedLine = null;
      newState.pathsShown = false;
      return newState;
    case PATH.SET_CLICKED_LINE_ID:
      newState.clickedLineId = payload;
      return newState;
    case PATH.SET_HOVERED_LINE_ID:
      newState.hoveredLineId = payload;
      return newState;
    case PATH.ADD_DRONE_PATH:
      newState.paths = payload;
      return newState;
    case PATH.SET_CLICKED_PATH:
      if(payload == null) {
        return newState;
      }
      newState.selectedPath = payload;
      return newState;
    case PATH.CLEAR_LINE_SELECTIONS:
      newState.selectedPath = null;
      newState.paths.clearSelections();
      return newState;
    case PATH.SHOWING_ALL_OBJECTS:
      newState.paths.setShowingObjects(!payload);
      return newState;
    case PATH.SHOW_OBJECTS_NEAR_PATH:
      newState.paths.showObjectsNearPoint();
      return newState;
    default:
      return state;
  }
};
