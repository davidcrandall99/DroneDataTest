import { initialPathState, PathRecuder, PATH } from "./paths";
import { initialObjectState ,ObjectReducer, OBJECTS } from "./object";
import { initialMapState , MapReducer, MAP } from "./map";

const combineReducers = (reducers) => {
  return (state, action) => {
    const newReducer = Object.keys(reducers).reduce(
      (prevState, key) => ({
        ...prevState,
        [key]: reducers[key](prevState[key], action),
      }),
      state
    );
    return newReducer
  };
};

export const rootState:any = {
  map: initialMapState,
  path: initialPathState,
  object: initialObjectState
}

export const rootActions = {
  map: MAP,
  object: OBJECTS,
  path: PATH
}

export const rootReducer:any = combineReducers({
  map: MapReducer,
  path: PathRecuder,
  object: ObjectReducer,
});
