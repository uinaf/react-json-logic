import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root element missing from index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
