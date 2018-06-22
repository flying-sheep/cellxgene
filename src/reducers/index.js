// jshint esversion: 6
import { combineReducers, createStore, applyMiddleware } from "redux";
import updateURLMiddleware from "../middleware/updateURLMiddleware";
// import updateCellSelectionMiddleware from "../middleware/updateCellSelectionMiddleware";
import updateCellColors from "../middleware/updateCellColors";

import thunk from "redux-thunk";

import initialize from "./initialize";
import cells from "./cells";
import expression from "./expression";
import controls from "./controls";
import differential from "./differential";
import responsive from "./responsive";
import userDefinedGenes from "./userDefinedGenes";

const Reducer = combineReducers({
  initialize,
  cells,
  expression,
  controls,
  differential,
  responsive,
  userDefinedGenes
});

let store = createStore(
  Reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(
    thunk,
    updateURLMiddleware,
    // updateCellSelectionMiddleware,
    updateCellColors
  )
);

export default store;
