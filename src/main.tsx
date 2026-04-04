import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent PWA service worker in preview/iframe contexts
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}
const hideSplash = () => {
  const splash = document.getElementById("splash-screen");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 400);
  }
};

createRoot(document.getElementById("root")!).render(<App />);

// Give React a tick to render, then hide splash
requestAnimationFrame(() => {
  requestAnimationFrame(hideSplash);
});
