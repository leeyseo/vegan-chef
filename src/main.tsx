import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AnalysisProvider } from "./state/AnalysisContext";
import { ModeProvider } from "./state/ModeContext";
import "./themes.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModeProvider>
        <AnalysisProvider>
          <App />
        </AnalysisProvider>
      </ModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
