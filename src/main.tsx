import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Hide splash screen after React mounts
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
