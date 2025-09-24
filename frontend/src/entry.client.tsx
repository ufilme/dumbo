import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./main.css";
import "@radix-ui/themes/styles.css";

ReactDOM.hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
