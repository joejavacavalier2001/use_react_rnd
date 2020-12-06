import {createStore, applyMiddleware} from "redux";
import promiseMiddleware from 'redux-promise-middleware';
//import currentGesture from "./reducers/gestureReducer2";
import gestureReducer from "./reducers/slideManagerReducer";
import playbackReducer from "./reducers/playbackReducer";
import googleReducer from "./reducers/googleReducer";
import { initialState } from "./reducers/defineInitialState";
import reduceReducers from 'reduce-reducers';
import isPromise from 'is-promise';

function errorMiddleware() {
  return next => action => {
	if (isPromise(action.payload)) {

      // Dispatch initial pending promise, but catch any errors
      return next(action).catch(error => {
        console.warn(error);
      });
    }

    return next(action);
  };
}

var reducedreducers = reduceReducers(null,gestureReducer,playbackReducer,googleReducer);
export default createStore(
    reducedreducers,
    initialState,
    applyMiddleware(errorMiddleware,promiseMiddleware)
);

