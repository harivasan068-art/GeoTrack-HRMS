import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/index.css";

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    console.log("New content available, auto-updating PWA...");
  },
  onOfflineReady() {
    console.log("GeoTrack HRMS PWA is ready to work offline.");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
