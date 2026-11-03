import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./bright-market.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline PWA support
if ("serviceWorker" in navigator && !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed silently
    });
  });
}
