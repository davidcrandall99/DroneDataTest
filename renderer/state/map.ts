export const initialMapState = {
  lat: null,
  lng: null,
  zoom: null,
};

// Map Actions
export const MAP = {
    SET_LNG_LAT: "SET_LNG_LAT"
}

export const MapReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const payload = action.payload;
  switch (action.type) {
    case MAP.SET_LNG_LAT:
      newState.lat = payload.lat;
      newState.lng = payload.lng;
      return newState;
    default:
      return state;
  }
};
