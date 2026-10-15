import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "@radix-ui/themes/styles.css";
import "./main.css";

ReactDOM.hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
);
