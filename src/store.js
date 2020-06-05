import {createStore, combineReducers, applyMiddleware} from "redux";
import promise from 'redux-promise-middleware';
//import currentGesture from "./reducers/gestureReducer2";
import currentGesture from "./reducers/slideManagerReducer";

const composeStoreWithMiddleware = applyMiddleware(
  promise
)(createStore);

export default composeStoreWithMiddleware(
    combineReducers({
		orm: currentGesture 
    }),{});


