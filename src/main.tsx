import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tokens.css";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
