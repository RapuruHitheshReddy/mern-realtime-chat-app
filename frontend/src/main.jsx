import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import { store } from "./store";
import App from "./App";
import "./index.css";

/**
 * App bootstrap
 * - Redux store provider
 * - Global toast handler
 */
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </Provider>
  </React.StrictMode>
);
