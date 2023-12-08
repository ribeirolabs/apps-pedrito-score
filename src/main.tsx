import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GameProvider } from "./core/game.tsx";
import { TranslationProvider } from "./intl/Provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TranslationProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </TranslationProvider>
  </React.StrictMode>
);
