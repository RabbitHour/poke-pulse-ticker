import { createRoot } from "react-dom/client";
import RenderBoundary from "./components/RenderBoundary";
import "./index.css";
import "./bright-market.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  import('./App.tsx').then(({default: App}) => root.render(<RenderBoundary><App /></RenderBoundary>)).catch(error => {
    console.error('Application startup failed', error);
    root.render(<main id="main-content" className="p-8"><h1>Poké Pulse Engine</h1><p>The page could not start. Check this preview’s connection settings, then reload.</p></main>);
  });
}

// Register service worker for offline PWA support
if ("serviceWorker" in navigator && !["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // SW registration failed silently
    });
  });
}
