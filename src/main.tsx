import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// v103: Self-hosted fonts via @fontsource — replaces remote Google Fonts
// (DSGVO: no IP transfer to Google; latin + latin-ext covers DE/EN/FR,
// Arabic falls back to system fonts, unchanged from before).
import "@fontsource/outfit/latin-300.css";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/outfit/latin-800.css";
import "@fontsource/outfit/latin-ext-300.css";
import "@fontsource/outfit/latin-ext-400.css";
import "@fontsource/outfit/latin-ext-500.css";
import "@fontsource/outfit/latin-ext-600.css";
import "@fontsource/outfit/latin-ext-700.css";
import "@fontsource/outfit/latin-ext-800.css";
import "@fontsource/merriweather/latin-400.css";
import "@fontsource/merriweather/latin-700.css";
import "@fontsource/merriweather/latin-ext-400.css";
import "@fontsource/merriweather/latin-ext-700.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
