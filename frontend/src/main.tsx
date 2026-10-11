import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AppStoreProvider } from "./store/AppStore.tsx";
import { SmoothScroll } from "./scroll/SmoothScroll.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppStoreProvider>
        <SmoothScroll>
          <App />
        </SmoothScroll>
      </AppStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
