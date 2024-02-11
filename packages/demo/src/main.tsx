import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n.js";

async function deferRender() {
   if (import.meta.env.VITE_USE_MOCKS !== "true") {
      return;
   }

   const { worker } = await import("../../../mocks/browser.ts");
   return worker.start();
}

deferRender().then(() => {
   ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
         <App />
      </React.StrictMode>
   );
});
