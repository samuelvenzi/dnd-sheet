import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Sheet from "../dnd_sheet";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sheet />
  </StrictMode>
);
