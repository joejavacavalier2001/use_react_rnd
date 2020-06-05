import React from 'react';
import {Provider} from "react-redux";
import store from "./store";
import GestureEditLayerParent from "./GestureEditLayerParent";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <GestureEditLayerParent />
    </Provider>
  );
}

export default App;
