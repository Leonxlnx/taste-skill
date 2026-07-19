import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { App } from "./site/App";
import "./site/styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Taste Blocks could not find the application root.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
